import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import * as serviceWorker from './serviceWorker';

const modStrings = {'r': 0, 'w': 1, 'x': 2};

function convertToShortString(permission_number) {
  if(permission_number >= 4) {
    return 'r' + convertToShortString(permission_number - 4);
  } else if (permission_number >= 2) {
    return 'w' + convertToShortString(permission_number - 2);
  } else if (permission_number >= 1) {
    return 'x' + convertToShortString(permission_number - 1);
  }

  return '';
}

function convertToString(permission_number) {
  let short_string = convertToShortString(permission_number)
  let sample_string = '';

  Object.keys(modStrings).forEach((key) => {
    if(short_string.includes(key)) {
      sample_string += key;
    } else {
      sample_string += '-';
    }
  });

  return sample_string;
}

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false, permission_value: this.props.permission_value };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    let permission_value = e.target.value;

    this.setState({ checked: !this.state.checked },
      () => { this.props.onCheckboxChange(permission_value, this.state.checked)
    });
  }

  render() {
    return (
      <div>
        <label><strong>{ this.props.permission_name }</strong></label>
        <input type="checkbox" name="permission" value={ this.props.permission_value } onChange={ this.handleChange } />
      </div>
    )
  }
}

class Permission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permission_number: 0,
      permission_group_name: props.permission_group_name
    };
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  async handleCheckboxChange(permission_value, checked) {
    let permission_number = this.state.permission_number;
    let permission_val = parseInt(permission_value);

    if(checked) {
      permission_number += permission_val;
    } else {
      permission_number -= permission_val;
    }

    await this.setState({ permission_number: permission_number });
    await this.props.onModChange(this.state.permission_number, this.state.permission_group_name);
  }

  render() {
    return (
      <div className="col-md-4">
        <h1>{ this.props.permission_group_name }</h1>
        <br/>
        <CheckBox permission_name="Read" permission_value="4" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
        <br/>
        <CheckBox permission_name="Write" permission_value="2" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
        <br/>
        <CheckBox permission_name="Execute" permission_value="1" onCheckboxChange={ this.handleCheckboxChange }></CheckBox>
      </div>
    )
  }
}

class LinuxPermission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner_permission: 0,
      group_permission: 0,
      public_permission: 0
    }
    this.handleModChange = this.handleModChange.bind(this);
  }

  async handleModChange(permission_number, permission_group_name) {
    switch(permission_group_name) {
      case 'Owner':
        await this.setState({ owner_permission: permission_number });
        break;
      case 'Group':
        await this.setState({ group_permission: permission_number });
        break;
      case 'Public':
        await this.setState({ public_permission: permission_number });
        break;
      default:
        break;
    }

    await this.props.onUpdatePermissionNumber(this.state);
  }

  render() {
    return (
      <div className="row">
        <Permission permission_group_name="Owner" onModChange={ this.handleModChange }></Permission>
        <Permission permission_group_name="Group" onModChange={ this.handleModChange }></Permission>
        <Permission permission_group_name="Public" onModChange={ this.handleModChange }></Permission>
      </div>
    )
  }
}

class ChmodCaculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permission_number: '',
      permission_string: ''
    };
    this.handleUpdatePermissionNumber = this.handleUpdatePermissionNumber.bind(this);
  }

  handleUpdatePermissionNumber(mods) {
    let permission_number = '';
    let permission_string = '';

    Object.keys(mods).forEach((key) => {
      permission_number += mods[key];
      permission_string += convertToString(parseInt(mods[key]));
    })

    this.setState({ permission_number: permission_number, permission_string: permission_string });
  }

  handlePermissionNumberChange() {

  }

  handlePermissionStringChange() {

  }

  render() {
    return(
      <div>
        <LinuxPermission onUpdatePermissionNumber={ this.handleUpdatePermissionNumber }></LinuxPermission>
        <br/>
        <div className="row">
          <h1 className="col-md-4">Linux Permissions</h1>
          <div className="col-md-4">
            <input type="text" name="permissions_number" placeholder="000" value={ this.state.permission_number } onChange={ this.handlePermissionNumberChange }/>
          </div>
          <div className="col-md-4">
            <input type="text" name="permissions_string" placeholder="rwxrwxrwx" value={ this.state.permission_string } onChange={ this.handlePermissionStringChange }/>
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
