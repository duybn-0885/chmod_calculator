import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

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
        <input type="checkbox" name="permission" value={ this.props.permissionValue } onChange={ this.handleChange } checked={ this.state.checked }/>
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
      permissionStringClassInput: '',
      linuxPermissionString: ''
    };
    this.handleUpdatePermissionNumber = this.handleUpdatePermissionNumber.bind(this);
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

  render() {
    return(
      <div>
        <LinuxPermission onUpdatePermissionNumber={ this.handleUpdatePermissionNumber } permissionString={ this.state.linuxPermissionString }></LinuxPermission>
        <br/>
        <div className="row">
          <h1 className="col-md-4">Linux Permissions</h1>
          <div className="col-md-4">
            <div>
              <input className="form-control" type="text" name="permissions_number" placeholder="000" value={ this.state.permissionNumber }/>
            </div>
          </div>
          <div className="col-md-4">
            <div>
              <input className="form-control" type="text" name="permissions_string" placeholder="rwxrwxrwx" value={ this.state.permissionString }/>
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
