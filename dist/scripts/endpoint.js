(function(){
  var SourceEndpoint = React.createClass({displayName: "SourceEndpoint",
    render: function(){
      return(
        React.createElement("span", null, 
          'var ep = gw2Api.endpoints.', this.props.name, ',\n'+
          '  params = ep.getParameters();\n'
        ));
    }
  });
  var SourceParameter = React.createClass({displayName: "SourceParameter",
    render: function(){
      var val = this.props.value;
      if((val || val ===0) && Array.isArray(val)){
        val = '[' + val.toString() + ']';
      }
      return(
        React.createElement("span", null, 
          'params.', this.props.name,  ' = ', val || 'null', ';\n'
        ));
    }
  });
  var SourceCode = React.createClass({displayName: "SourceCode",
    render: function(){
      var prop,
        parameters = [];
      for(prop in this.props.parameters){
        if(prop === 'type'){continue;}
        if(this.props.parameters.hasOwnProperty(prop)){
          if(typeof this.props.parameters[prop] === 'function' || !this.props.parameters[prop]){
            continue;
          }
          parameters.push(React.createElement(SourceParameter, {value: this.props.parameters[prop], name: prop}));
        }
      }
      //todo: build source code from parameters values and endpoint
      if(this.props.endpoint){
        return (
          React.createElement("div", null, 
            React.createElement("h3", null, "Source Code"), 
            React.createElement("pre", null, 
              React.createElement(SourceEndpoint, {name: this.props.endpoint.key}), 
              parameters, 
              'ep.get(params).then(function(response)\{\n'+
              '  var data, headers;\n'+
              '  data = response.data;\n'+
              '  headers = response.headers;\n'+
              '\};'
            )
          ));
      }
      return (React.createElement("span", null));
    }
  });
  var CallResponse = React.createClass({displayName: "CallResponse",
    render: function(){
      if(this.props.response){
        return(
          React.createElement("div", null, 
            React.createElement("h3", null, "Data"), 
            React.createElement("div", {className: "well"}, 
              React.createElement("p", {className: "bg-danger"}, this.props.callState), 
              React.createElement("span", null, JSON.stringify(this.props.response.data))
            )
          )
        );
      } else{
        return(React.createElement("div", null));
      }
    }
  });
  var TextBox = React.createClass({displayName: "TextBox",
    handleChange: function(){
      var val = this.refs[this.props.name].getDOMNode().value;
      this.props.onUserInput(this.props.name,val);
    },
    render: function(){
      return (
        React.createElement("div", {className: "input-group"}, 
          React.createElement("label", {className: "input-group-addon"}, this.props.name), 
          React.createElement("input", {className: "form-control", value: this.props.value, type: "text", ref: this.props.name, name: this.props.name, onChange: this.handleChange}), 
          React.createElement("span", {className: "input-group-addon"}, 
            React.createElement(Error, {message: this.props.errors[this.props.name]})
          )
        ));
    }
  });
  var MultiBox = React.createClass({displayName: "MultiBox",
    handleChange: function(){
      var valArray,
        val = this.refs[this.props.name].getDOMNode().value;
      if(val){
        var rtrim = /^[\[]+|[\]]+$/g;
        val = val.replace(rtrim, '');
        valArray = val.split(',');
      }
      this.props.onUserInput(this.props.name, valArray);
    },
    render: function(){
      return (
        React.createElement("div", {className: "input-group"}, 
          React.createElement("label", {className: "input-group-addon"}, this.props.name), 
          React.createElement("input", {className: "form-control", value: this.props.value, type: "text", ref: this.props.name, name: this.props.name, onChange: this.handleChange}), 
          React.createElement("span", {className: "input-group-addon"}, 
            React.createElement(Error, {message: this.props.errors[this.props.name]})
          )
        ));
    }
  });
  var ParameterInput = React.createClass({displayName: "ParameterInput",
    handleUserInput: function(prop, val){
      console.log(prop + ': ' + val);
      this.props.onUserInput(prop, val);
    },
    render: function(){
      var parameters = [];
      var prop;
      for(prop in this.props.parameters){
        if(prop === 'type')
          continue;
        if(this.props.parameters.hasOwnProperty(prop)){
          if(typeof this.props.parameters[prop] === 'function')
            continue;
          // :(
          if(prop === 'ids'){
            parameters.push(React.createElement(MultiBox, {value: this.props.parameters[prop], name: prop, ref: prop, onUserInput: this.handleUserInput, errors: this.props.errors}));
          } else {
            parameters.push(React.createElement(TextBox, {value: this.props.parameters[prop], name: prop, ref: prop, onUserInput: this.handleUserInput, errors: this.props.errors}));
          }
        }
      }
      return (
        React.createElement("div", {className: !parameters || !parameters.length ? 'hidden' : ''}, 
          React.createElement("h3", null, "Data"), 
          React.createElement("div", {className: "input-group"}, 
            parameters
          )
        )
      );
    }
  });
  var EndpointSelectors = React.createClass({displayName: "EndpointSelectors",
    handleChange: function() {
        this.props.onUserInput(
            this.refs.epName.getDOMNode().value
        );
    },
    render: function(){
      var endpoints = [];
      this.props.endpoints.forEach(function(ep){
        endpoints.push(React.createElement("option", {value: ep}, ep));
      });
      return (
        React.createElement("div", {className: "input-group"}, 
          React.createElement("label", null, "Select an endpoint"), 
          React.createElement("select", {className: "form-control", 
            onChange: this.handleChange, 
            ref: "epName"}, 
            endpoints
          )
        )
      );
    }
  });
  var Error = React.createClass({displayName: "Error",
    render: function(){
      return (
        React.createElement("div", null, 
          this.props.message
        ));
    }
  });
  var Url = React.createClass({displayName: "Url",
    render: function(){
      if(this.props.endpoint && this.props.parameters){
        return(
          React.createElement("div", null, 
            React.createElement("h3", null, "Url"), 
            React.createElement("div", {className: "well"}, 
              this.props.endpoint.url(this.props.parameters)
            )
          ));
      }
      return(React.createElement("div", null));
    }
  });

  var EndpointContainer = React.createClass({displayName: "EndpointContainer",
    getInitialState: function(){
      return {
        endpoint: null,
        parameters: [],
        errors: {},
        callState: null,
        response: null
      };
    },
    handleUserInput: function(epName){
      //get endpoint
      var params,
        ep = getPropertyFromName(epName, gw2Api.endpoints);
      //get parameters
      if(ep){
        params = ep.getParameters();
      }
      params = params || {};
      this.setState({
        endpoint: ep,
        parameters: params,
        callState: null,
        response: null
      });
    },
    handleUserTextInput: function(param, val){
      //get endpoint
      if(this.state.parameters && this.state.parameters.hasOwnProperty(param)){
        try{
          this.state.parameters[param] = val;
          this.state.errors[param] = null;
          this.setState({
            parameters: this.state.parameters,
            errors: this.state.errors,
            callState: null,
            response: null
          });
        } catch (e){
        this.state.errors[param] = e.message;
          this.setState({
            errors: this.state.errors
          });
        }
      }
    },
    handleCall: function(){
      var myThis = this;
      if(!this.state.endpoint || !this.state.parameters){
        this.setState({
          callState: 'endpoint not selected',
          response: null
        });
      }
      try{
        this.state.endpoint.get(this.state.parameters).then(function(response){
          myThis.setState({
            callState: null,
            response: response
          });
        }).fail(function(response){
          myThis.setState({
            callState:  JSON.stringify(response),
            response: response
          });
        }).catch(function(e){
          var errorMessage;
          if(e && e.message){
            errorMessage = e.message;
          }
          myThis.setState({
            callState: errorMessage || JSON.stringify(e),
            response: e
          });
        });
      } catch(e){
        var errorMessage;
        if(e && e.message){
          errorMessage = e.message;
        }
        this.setState({
          callState: errorMessage || JSON.stringify(e),
          response: e
        });
      }
    },
    render: function(){
      return (
        React.createElement("div", {className: "container-fluid"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement(EndpointSelectors, {
              endpoints: this.props.endpoints, 
              onUserInput: this.handleUserInput})
          ), 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-md-4"}, 
              React.createElement(ParameterInput, {parameters: this.state.parameters, onUserInput: this.handleUserTextInput, errors: this.state.errors})
            ), 
            React.createElement("div", {className: "col-md-4"}, 
              React.createElement(SourceCode, {parameters: this.state.parameters, endpoint: this.state.endpoint})
            ), 
            React.createElement("div", {className: "col-md-4"}, 
              React.createElement(Url, {parameters: this.state.parameters, endpoint: this.state.endpoint})
            )
          ), 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: (!this.state.parameters || !this.state.endpoint) ? 'hidden' : ''}, 
              React.createElement("button", {className: "space btn btn-default col-md-12", disabled: !this.state.parameters || !this.state.endpoint, onClick: this.handleCall}, "Execute")
            )
          ), 
          React.createElement("div", {className: "row"}, 
            React.createElement(CallResponse, {callState: this.state.callState, response: this.state.response})
          )
        )
      );
    }
  });
  var endpoints = gw2Api.endpointKeys;
  endpoints.unshift('');

  React.render(React.createElement(EndpointContainer, {endpoints: endpoints}), document.getElementById('dlr-samples'));

  function getPropertyFromName(name, eps){
    var nameArray, index, leaf, lastNodeIndex, node, part;
    nameArray = name.split('.');
    lastNodeIndex = nameArray.length - 1;
    leaf = nameArray[lastNodeIndex];
    node = eps;
    //handle nested objects
    for(index = 0; index < lastNodeIndex; index ++){
      part = nameArray[index];
      if(node[part]){
        node = node[part];
        continue;
      } else{
        //the endpoint doesn't exist under the name chain
        break;
      }
    }
    //handle leaf and return endpoint
    return node[nameArray[lastNodeIndex]];
  }
}());
