import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

const regexPermissionNumber = /^[0-7]{3}$/g;
const regexPermissionString = /^([r-][w-][x-]){3}$g/;
const modStrings = {
  '---': 0,
  '--x': 1,
  '-w-': 2,
  '-wx': 3,
  'r--': 4,
  'r-x': 5,
  'rw-': 6,
  'rwx': 7
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false, permissionValue: this.props.permissionValue };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    let permissionValue = e.target.value;

    this.setState({ checked: !this.state.checked },
      () => { this.props.onCheckboxChange(permissionValue, this.state.checked)
    });
  }

  render() {
    return (
      <div>
        <label><strong>{ this.props.permissionName }</strong></label>
        <input type="checkbox" name="permission" value={ this.props.permissionValue } onChange={ this.handleChange } checked={this.props.permission}/>
      </div>
    )
  }
}

class Permission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionNumber: 0,
      permissionGroupName: props.permissionGroupName,
    };
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  async handleCheckboxChange(permissionValue, checked) {
    let permissionNumber = this.state.permissionNumber;
    let permissionVal = parseInt(permissionValue);

    if(checked) {
      permissionNumber += permissionVal;
    } else {
      permissionNumber -= permissionVal;
    }

    await this.setState({ permissionNumber: permissionNumber });
    await this.props.onModChange(this.state.permissionNumber, this.state.permissionGroupName);
  }

  render() {
    let readPermission = this.props.permissionString[0] === 'r' ? true : false;
    let writePermission = this.props.permissionString[1] === 'w' ? true : false;
    let executePermission = this.props.permissionString[2] === 'x' ? true : false;

    return (
      <div className="col-md-4">
        <h1>{ this.props.permissionGroupName }</h1>
        <br/>
        <CheckBox permissionName="Read" permissionValue="4" onCheckboxChange={ this.handleCheckboxChange } permission= { readPermission }></CheckBox>
        <br/>
        <CheckBox permissionName="Write" permissionValue="2" onCheckboxChange={ this.handleCheckboxChange } permission= { writePermission }></CheckBox>
        <br/>
        <CheckBox permissionName="Execute" permissionValue="1" onCheckboxChange={ this.handleCheckboxChange } permission= { executePermission }></CheckBox>
      </div>
    )
  }
}

class LinuxPermission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerPermission: 0,
      groupPermission: 0,
      publicPermission: 0,
    }
    this.handleModChange = this.handleModChange.bind(this);
  }

  async handleModChange(permissionNumber, permissionGroupName) {
    switch(permissionGroupName) {
      case 'Owner':
        await this.setState({ ownerPermission: permissionNumber });
        break;
      case 'Group':
        await this.setState({ groupPermission: permissionNumber });
        break;
      case 'Public':
        await this.setState({ publicPermission: permissionNumber });
        break;
      default:
        break;
    }

    await this.props.onUpdatePermissionNumber(this.state);
  }

  render() {
    let ownerPermissionString = this.props.permissionString.substring(0, 3);
    let groupPermissionString = this.props.permissionString.substring(3, 6);
    let publicPermissionString = this.props.permissionString.substring(6, 9);

    return (
      <div className="row">
        <Permission permissionGroupName="Owner" onModChange={ this.handleModChange } permissionString={ ownerPermissionString }></Permission>
        <Permission permissionGroupName="Group" onModChange={ this.handleModChange } permissionString={ groupPermissionString }></Permission>
        <Permission permissionGroupName="Public" onModChange={ this.handleModChange } permissionString={ publicPermissionString }></Permission>
      </div>
    )
  }
}

class ChmodCaculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionNumber: '',
      permissionString: '',
      permissionNumberClassInput: '',
      permissionStringClassInput: ''
    };
    this.handleUpdatePermissionNumber = this.handleUpdatePermissionNumber.bind(this);
    this.handlePermissionNumberChange = this.handlePermissionNumberChange.bind(this);
    this.handlePermissionNumberEntered = this.handlePermissionNumberEntered.bind(this);
    this.handlePermissionStringChange = this.handlePermissionStringChange.bind(this);
    this.handlePermissionStringEntered = this.handlePermissionStringEntered.bind(this);
  }

  handleUpdatePermissionNumber(mods) {
    let permissionNumber = '';
    let permissionString = '';

    Object.keys(mods).forEach((key) => {
      permissionNumber += mods[key];
      permissionString += getKeyByValue(modStrings, parseInt(mods[key]));
    })

    this.setState({ permissionNumber: permissionNumber, permissionString: permissionString });
  }

  handlePermissionNumberChange(e) {
    this.setState({ permissionNumber: e.target.value });
  }

  handlePermissionStringChange(e) {
    this.setState({ permissionString: e.target.value });
  }

  handlePermissionNumberEntered(e) {
    if(e.key === 'Enter') {
      if(e.target.value.match(regexPermissionNumber)) {
        let permissionNumber = e.target.value;
        let permissionString = '';

        [...permissionNumber].forEach(permissionvVal => permissionString += getKeyByValue(modStrings, parseInt(permissionvVal)));

        this.setState({
          permissionNumber: permissionNumber,
          permissionString: permissionString,
          permissionNumberClassInput: 'has-success'
        });
      } else {
        this.setState({ permissionNumberClassInput: 'has-error' });
      }
    }
  }

  handlePermissionStringEntered(e) {
    if(e.key === 'Enter') {
      if(e.target.value.match(regexPermissionString)) {
        this.setState({
          permissionString: e.target.value,
          permissionStringClassInput: 'has-success'
        });
      } else {
        this.setState({ permissionStringClassInput: 'has-error' });
      }
    }
  }

  render() {
    return(
      <div>
        <LinuxPermission onUpdatePermissionNumber={ this.handleUpdatePermissionNumber } permissionString={ this.state.permissionString }></LinuxPermission>
        <br/>
        <div className="row">
          <h1 className="col-md-4">Linux Permissions</h1>
          <div className="col-md-4">
            <div className={`form-group ${this.state.permissionNumberClassInput}`}>
              <input type="text" name="permissions_number" placeholder="000" value={ this.state.permissionNumber } onChange={ this.handlePermissionNumberChange } onKeyPress= { this.handlePermissionNumberEntered }/>
            </div>
          </div>
          <div className="col-md-4">
            <div className={`form-group ${this.state.permissionStringClassInput}`}>
              <input type="text" name="permissions_string" placeholder="rwxrwxrwx" value={ this.state.permissionString } onChange={ this.handlePermissionStringChange } onKeyPress= { this.handlePermissionStringEntered }/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <ChmodCaculator></ChmodCaculator>,
  document.getElementById('root')
);

serviceWorker.unregister();
