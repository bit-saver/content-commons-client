import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const DropdownLanguage = props => {
  const { data, ...rest } = props;
  return <Dropdown { ...rest } options={ data.languages } />;
};

DropdownLanguage.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  data: PropTypes.object,
  fluid: PropTypes.bool,
  required: PropTypes.bool,
  selection: PropTypes.bool,
  options: PropTypes.array
};

const LANGUAGES_QUERY = gql`
  query Languages($orderBy: LanguageOrderByInput) {
    languages(orderBy: $orderBy) {
      value: id
      text: displayName
    }
  }
`;

export default graphql( LANGUAGES_QUERY, {
  options: {
    variables: { orderBy: 'displayName_ASC' }
  }
} )( DropdownLanguage );

export { LANGUAGES_QUERY };
