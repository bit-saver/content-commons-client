/**
 *
 * Global Nav
 *
 * TODO: Need to rewrite menus without the semantic ui
 * <Responsive /> as it throws an error due to ssr:
 * "Warning: Did not expect server HTML to contain a <i> in <nav>""
 *
 */
import React, { PureComponent } from 'react';
import { Icon, Responsive } from 'semantic-ui-react';
import LoggedInNav from './LoggedInNav/LoggedInNav';
import LoggedOutNav from './LoggedOutNav/LoggedOutNav';
import User from '../../User/User';

import './global.scss';

class GlobalNav extends PureComponent {
  constructor( props ) {
    super( props );
    this.state = {
      mobileNavVisible: false
    };
  }


  handleKeyUp = e => {
    if ( e.key === 'Enter' ) {
      this.handleNavClick();
    }
  }

  handleNavClick = () => {
    const { mobileNavVisible } = this.state;
    if ( !mobileNavVisible ) {
      this.setState( { mobileNavVisible: true } );
    } else {
      this.setState( { mobileNavVisible: false } );
    }
  }

  renderNav( authenticatedUser ) {
    const { mobileNavVisible } = this.state;

    if ( authenticatedUser ) {
      return (
        <LoggedInNav
          mobileNavVisible={ mobileNavVisible }
          toggleMobileNav={ this.handleNavClick }
          keyUp={ this.keyUp }
          user={ authenticatedUser }
        />
      );
    }

    return (
      <LoggedOutNav
        mobileNavVisible={ mobileNavVisible }
        toggleMobileNav={ this.handleNavClick }
        keyUp={ this.keyUp }
      />
    );
  }

  render() {
    const { mobileNavVisible } = this.state; // this is why the mobile nav flickers on

    return (
      <nav>
        <Responsive
          as={ Icon }
          name="content"
          maxWidth={ 992 }
          onClick={ this.handleNavClick }
          onKeyUp={ this.keyUp }
          tabIndex={ 0 }
          className={ mobileNavVisible ? 'mobileNav' : 'fullNav' }
        />
        <User>
          { ( { data } ) => {
            const authenticatedUser = ( data && data.authenticatedUser ) ? data.authenticatedUser : null;
            return this.renderNav( authenticatedUser );
          }
        }
        </User>
      </nav>
    );
  }
}

export default GlobalNav;
