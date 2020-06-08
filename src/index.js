import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import * as serviceWorker from './serviceWorker';

const modStrings = {'r': 0, 'w': 1, 'x': 2};
const regexPermissionNumber = /^[0-7]{3}$/g;
const regexPermissionString = /^([r-][w-][x-]){3}$g/;

function convertToShortString(permissionNumber) {
  if(permissionNumber >= 4) {
    return 'r' + convertToShortString(permissionNumber - 4);
  } else if (permissionNumber >= 2) {
    return 'w' + convertToShortString(permissionNumber - 2);
  } else if (permissionNumber >= 1) {
    return 'x' + convertToShortString(permissionNumber - 1);
  }

  return '';
}

function convertToString(permissionNumber) {
  let shortString = convertToShortString(permissionNumber)
  let sampleString = '';

  Object.keys(modStrings).forEach((key) => {
    if(shortString.includes(key)) {
      sampleString += key;
    } else {
      sampleString += '-';
    }
  });

  return sampleString;
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
        <input type="checkbox" name="permission" value={ this.props.permissionValue } onChange={ this.handleChange } />
      </div>
    )
  }
}

class Permission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionNumber: 0,
      permissionGroupName: props.permissionGroupName
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
    return (
      <div className="col-md-4">
        <h1>{ this.props.permissionGroupName }</h1>
        <br/>
        <CheckBox permissionName="Read" permissionValue="4" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
        <br/>
        <CheckBox permissionName="Write" permissionValue="2" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
        <br/>
        <CheckBox permissionName="Execute" permissionValue="1" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
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
      publicPermission: 0
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
    return (
      <div className="row">
        <Permission permissionGroupName="Owner" onModChange={ this.handleModChange }></Permission>
        <Permission permissionGroupName="Group" onModChange={ this.handleModChange }></Permission>
        <Permission permissionGroupName="Public" onModChange={ this.handleModChange }></Permission>
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
    this.handlePermissionStringChange = this.handlePermissionStringChange.bind(this);
    this.handlePermissionNumberEntered = this.handlePermissionNumberEntered.bind(this);
    this.handlePermissionStringEntered = this.handlePermissionStringEntered.bind(this);
  }

  handleUpdatePermissionNumber(mods) {
    let permissionNumber = '';
    let permissionString = '';

    Object.keys(mods).forEach((key) => {
      permissionNumber += mods[key];
      permissionString += convertToString(parseInt(mods[key]));
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
    if(e.key == 'Enter') {
      if(e.target.value.match(regexPermissionNumber)) {
        this.setState({
          permissionString: e.target.value,
          permissionStringClassInput: 'has-success'
        });
      } else {
        this.setState({ permissionNumberClassInput: 'has-error' });
      }
    }
  }

  handlePermissionStringEntered(e) {
    if(e.key == 'Enter') {
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
        <LinuxPermission onUpdatePermissionNumber={ this.handleUpdatePermissionNumber }></LinuxPermission>
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
