(function(){
  var SourceEndpoint = React.createClass({
    render: function(){
      return(
        <span>
          {'var ep = gw2Api.endpoints.'}{this.props.name}{',\n'+
          '  params = ep.getParameters();\n'}
        </span>);
    }
  });
  var SourceParameter = React.createClass({
    render: function(){
      var rawVal = this.props.value, val = '', index;
      if(Array.isArray(rawVal)){
        for(index = 0; index < rawVal.length; index ++){
          if(rawVal[index] || rawVal[index] === 0){
            val += formatValForParameter(rawVal[index]) + ',';
          }
        }
        val = '[' + val.replace(/^[,]+|[,]+$/g, '') + ']';
      } else {
        val = formatValForParameter(rawVal);
      }
      return(
        <span>
          {'params.'}{this.props.name}{ ' = ' }{val}{';\n'}
        </span>);
    }
  });
  var SourceCode = React.createClass({
    render: function(){
      var prop,
        parameters = [];
      for(prop in this.props.parameters){
        if(prop === 'type'){continue;}
        if(this.props.parameters.hasOwnProperty(prop)){
          if(typeof this.props.parameters[prop] === 'function' || !(this.props.parameters[prop] || this.props.parameters[prop] === 0)){
            continue;
          }
          parameters.push(<SourceParameter value={this.props.parameters[prop]} name={prop} />);
        }
      }
      //todo: build source code from parameters values and endpoint
      if(this.props.endpoint){
        return (
          <div>
            <h3>Source Code</h3>
            <pre>
              <SourceEndpoint name={this.props.endpoint.key} />
              {parameters}
              {'ep.get(params).then(function(response)\{\n'+
              '  var data, headers;\n'+
              '  data = response.data;\n'+
              '  headers = response.headers;\n'+
              '\};'}
            </pre>
          </div>);
      }
      return (<span></span>);
    }
  });
  var CallResponse = React.createClass({
    render: function(){
      if(this.props.response){
        return(
          <div>
            <h3>Data</h3>
            <div className="well">
              <p className="bg-danger">{this.props.callState}</p>
              <span>{JSON.stringify(this.props.response.data)}</span>
            </div>
          </div>
        );
      } else{
        return(<div></div>);
      }
    }
  });
  var TextBox = React.createClass({
    handleChange: function(){
      var val = this.refs[this.props.name].getDOMNode().value;
      this.props.onUserInput(this.props.name,val);
    },
    render: function(){
      return (
        <div className="input-group">
          <label className="input-group-addon">{this.props.name}</label>
          <input className="form-control" value={this.props.value} type="text" ref={this.props.name} name={this.props.name} onChange={this.handleChange}/>
          <span className="input-group-addon">
            <Error message={this.props.errors[this.props.name]} />
          </span>
        </div>);
    }
  });
  var MultiBox = React.createClass({
    handleChange: function(){
      var valArray,
        val = this.refs[this.props.name].getDOMNode().value;
      if(val || val === 0){
        var rtrim = /^[\[]+|[\]]+$/g;
        val = val.replace(rtrim, '');
        valArray = val.split(',');
      }
      this.props.onUserInput(this.props.name, valArray);
    },
    render: function(){
      return (
        <div className="input-group">
          <label className="input-group-addon">{this.props.name}</label>
          <input className="form-control" value={this.props.value} type="text" ref={this.props.name} name={this.props.name} onChange={this.handleChange}/>
          <span className="input-group-addon">
            <Error message={this.props.errors[this.props.name]} />
          </span>
        </div>);
    }
  });
  var ParameterInput = React.createClass({
    handleUserInput: function(prop, val){
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
            parameters.push(<MultiBox value={this.props.parameters[prop]} name={prop} ref={prop} onUserInput={this.handleUserInput} errors={this.props.errors} />);
          } else {
            parameters.push(<TextBox value={this.props.parameters[prop]} name={prop} ref={prop} onUserInput={this.handleUserInput} errors={this.props.errors} />);
          }
        }
      }
      return (
        <div className={!parameters || !parameters.length ? 'hidden' : ''}>
          <h3>Data</h3>
          <div className="input-group">
            {parameters}
          </div>
        </div>
      );
    }
  });
  var EndpointSelectors = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.epName.getDOMNode().value
        );
    },
    render: function(){
      var endpoints = [];
      this.props.endpoints.forEach(function(ep){
        endpoints.push(<option value={ep}>{ep}</option>);
      });
      return (
        <div className="input-group">
          <label>Select an endpoint</label>
          <select className="form-control"
            onChange={this.handleChange}
            ref="epName">
            {endpoints}
          </select>
        </div>
      );
    }
  });
  var Error = React.createClass({
    render: function(){
      return (
        <div>
          {this.props.message}
        </div>);
    }
  });
  var Url = React.createClass({
    render: function(){
      if(this.props.endpoint && this.props.parameters){
        return(
          <div>
            <h3>Url</h3>
            <div className="well">
              {this.props.endpoint.url(this.props.parameters)}
            </div>
          </div>);
      }
      return(<div></div>);
    }
  });

  var EndpointContainer = React.createClass({
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
        <div className="container-fluid">
          <div className="row">
            <EndpointSelectors
              endpoints={this.props.endpoints}
              onUserInput={this.handleUserInput} />
          </div>
          <div className="row">
            <div className="col-md-4">
              <ParameterInput parameters={this.state.parameters} onUserInput={this.handleUserTextInput} errors={this.state.errors}/>
            </div>
            <div className="col-md-4">
              <SourceCode parameters={this.state.parameters} endpoint={this.state.endpoint} />
            </div>
            <div className="col-md-4">
              <Url parameters={this.state.parameters} endpoint={this.state.endpoint} />
            </div>
          </div>
          <div className="row">
            <div className={(!this.state.parameters || !this.state.endpoint) ? 'hidden' : ''}>
              <button className="space btn btn-default col-md-12" disabled={!this.state.parameters || !this.state.endpoint} onClick={this.handleCall}>Execute</button>
            </div>
          </div>
          <div className="row">
            <CallResponse callState={this.state.callState} response={this.state.response} />
          </div>
        </div>
      );
    }
  });
  var endpoints = gw2Api.endpointKeys;
  endpoints.unshift('');

  React.render(<EndpointContainer endpoints={endpoints} />, document.getElementById('dlr-samples'));
  function formatValForParameter(value){
    if(!(value || value === 0)){
      return 'null';
    }
    if (typeof value === 'number')
    {
      return value;
    }
    return "'" + value + "'";
  }
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
