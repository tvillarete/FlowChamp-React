import React, { Component } from 'react';
import LoadingIndicator from 'react-loading-indicator';
import UserManager from '../../UserManager';
import ToggleButton from '../components/ToggleButton';

export default class LoginView extends Component {
   state = {
      onSignup: false,
      error: false,
   };

   handleEvent = (options) => {
      switch(options.type) {
         case 'show-signup':
            this.setState({onSignup: true})
         break;
         case 'show-login':
            this.setState({onSignup: false})
         break;
         case 'route':
            this.route(options);
            break;
         case 'error':
            this.displayError(options);
            break;
         case 'clear-error':
            this.setState({error: false});
            break;
         default:
            this.props.onEvent(options);
         break;
      }
   }

   route = options => {
      let route = this.props.route;
      if (route === 'empty-views') {
         this.props.onEvent({
            type: 'empty-views'
         });
      } else if (route === 'chartSelect' && !this.props.user.config.start_year) {
         this.props.onEvent({
            type: 'change-view',
            value: 'yearSelect',
            route: route,
            data: options.data
         });
      } else {
         this.props.onEvent({
            type: 'change-view',
            value: route
         });
      }
   }

   displayError = options => {
      this.setState({error: options.value});
   }

   render() {
      const {
         onSignup,
      } = this.state;

      return (
         <div className={`sidebar-view sidebar-login-view
            ${this.props.isPrevView ? 'slide-in-left' : ''}
            ${this.props.isEnteringNewView ? 'entering-new-view' : ''}
            ${this.props.isEnteringOldView ? 'entering-old-view' : ''}`}>
            <div className="login-image-container">
               <img alt="FlowChamp Logo" src="images/icons/logo_text.svg"/>
            </div>
            {onSignup
               ?  <SignupForm {...this.props} onEvent={this.handleEvent}/>
               : <LoginForm {...this.props} onEvent={this.handleEvent}/>}
         </div>
      );
   }
}

class LoginForm extends Component {
   state = {
      isLoading: false,
      error: false,
      remember: false,
   }

   signupView = () => {
      this.props.onEvent({
         type: 'show-signup',
      });
   }

   handleSubmit = (e) => {
      this.setState({isLoading: true});
      if (e) e.preventDefault();
      const username = this.refs.username.value;
      const password = this.refs.password.value;

      this.setState({ error: false });

      UserManager.login({
         username: username,
         password: password,
         remember: this.state.remember
      }).then((data) => {
         this.props.onEvent({
            type: 'user-login',
            value: data
         });
         this.props.onEvent({
            type: 'get-active-chart',
         });
         this.props.onEvent({
            type: 'route',
				data: data,
         });
      }).catch(error => {
         this.setState({
            error: error.message,
            isLoading: false
         });
      });
   }

   toggleRemember = checked => {
      this.setState({ remember: checked });
   }

   render() {
      return (
         <div className="signup-form">
            <h3 className="signup-button"
               onClick={this.signupView}>Need an account? &gt;</h3>
            <form onSubmit={this.handleSubmit}>
               <input required type="text" placeholder="Username" ref="username" autoFocus/>
               <input required type="password" placeholder="Password" ref="password"/>
               <ToggleButton
                  label="Remember me"
                  classNames={'in-form'}
                  checked={this.state.remember}
                  onEvent={this.toggleRemember}/>
               <h3 className="error-msg">{this.state.error}</h3>
               <div className="submit-container">
                  <input className="submit-button" type="submit" value="Log In" />
                  <div className="loading-indicator">
                  {this.state.isLoading
                     ? <LoadingIndicator className="loading-indicator"
                        segmentLength={8} segmentWidth={3}/> : ''}
                  </div>
               </div>
            </form>
         </div>
      );
   }
}

class SignupForm extends Component {
   state = {
      isLoading: false,
      error: false,
   }

   signupView = () => {
      this.props.onEvent({
         type: 'show-login',
      });
   }

   handleSubmit = (e) => {
      if (e) e.preventDefault();
      const email = this.refs.email.value;
      const username = this.refs.username.value;
      const password = this.refs.password.value;
      const password2 = this.refs.password2.value;
      let errorPassword = this.validatePassword(password, password2);
      let errorEmail = this.validateEmail(email)

      if (errorPassword) {
         this.setState({error: errorPassword});
         return;
      } else if (errorEmail) {
         this.setState({error: errorEmail});
         return;
      } else {
         this.setState({error: false});
         this.setState({isLoading: true});
      }

      UserManager.requestPin({
         email: email
      }).then((response) => {
         this.props.onEvent({
            type: 'change-view',
            value: 'pin',
            data: {
               email: email,
               username: username,
               password: password,
               token: response.token
            },
            route: 'chartSelect'
         });
      }).catch((error) => {
         alert(error);
      });
   }

   validatePassword = (p1, p2) => {
      if (p1 !== p2) {
         return "Passwords don't match :/";
      } else if (p1.length < 6) {
         return "Password not long enough :/";
      }
      return false;
   }

   validateEmail = email => {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email) ? false : `Email isn't valid :/`;
   }

   render() {
      const {
         error
      } = this.state;

      return (
         <div className="signup-form">
            <h3 className="signup-button"
               onClick={this.signupView}>Already have an account? &gt;</h3>
            <form onSubmit={this.handleSubmit}>
               <input required type="text" placeholder="Username" ref="username" autoFocus/>
               <input required type="text" placeholder="Email" ref="email"/>
               <input required type="password" placeholder="Password" ref="password"/>
               <input required type="password" placeholder="Retype Password" ref="password2"/>
               <h3 className="error-msg">{error}</h3>
               <div className="submit-container">
                  <input className="submit-button" type="submit" value="Sign Up" />
                  <div className="loading-indicator">
                  {this.state.isLoading
                     ? <LoadingIndicator className="loading-indicator"
                        segmentLength={8} segmentWidth={3}/> : ''}
                  </div>
               </div>
            </form>
         </div>
      );
   }
}
