/**
 *
 * EditSupportFileRow
 *
 */
import React, { Fragment } from 'react';
import { array, func, object } from 'prop-types';
import {
  Button, Dropdown, Popup, Table
} from 'semantic-ui-react';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import debounce from 'lodash/debounce';

import Focusable from 'components/Focusable/Focusable';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';

import { SUPPORT_FILES_QUERY } from 'components/admin/projects/ProjectEdit/EditSupportFilesContent/EditSupportFilesContent';

import './EditSupportFileRow.scss';

/**
 * @todo delete later after updating datamodel
 * for `SupportFile` `use` field
 */
const imageUses = [
  {
    value: '1',
    text: 'Thumbnail/Cover Image'
  },
  {
    value: '2',
    text: 'Social Media Graphic'
  },
  {
    value: '3',
    text: 'Email Graphic'
  },
  {
    value: '4',
    text: 'Website Hero Image'
  }
];

/* eslint-disable react/prefer-stateless-function */
class EditSupportFileRow extends React.PureComponent {
  constructor( props ) {
    super( props );

    this.DELAY_INTERVAL = 1000;
    this.STR_INDEX_PROPORTION = 0.04;
    this.ITEM_NAME_PROPORTION = 0.85;
    this.debounceResize = debounce( this.resetWidths, this.DELAY_INTERVAL );
    this._isMounted = false;

    this.state = {
      cellWidth: null,
      fileNameWidth: null,
      fileUse: '',
      fileLanguageId: ''
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
    window.addEventListener( 'resize', this.debounceResize );
    this.setState( {
      fileUse: '1'/* @todo replace w/ `this.props.file.use` later */,
      fileLanguageId: this.props.file.language.id
    } );
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    window.removeEventListener( 'resize', this.debounceResize );
  }

  /**
   * Truncates long strings with ellipsis
   * @param {string} str the string
   * @param {number} start index for first cutoff point
   * @param {number} end index for ending cutoff point
   * @return truncated string
   */
  getShortFileName = ( str, index ) => (
    <Fragment>
      { `${str.substr( 0, index )}` }&hellip;{ `${str.substr( -index )}` }
    </Fragment>
  );

  /**
   * Determines an integer proportional
   * to a reference number
   * @param {number} reference
   * @return {number}
   */
  getProportionalNumber = ( reference, proportion ) => (
    Math.floor( reference * proportion )
  )

  setReplaceFileRef = input => {
    this.addReplaceFileRef = input;
  }

  /**
   * Declares a React ref & sets its width in state
   * @param {node} React node
   * @param {string} name of React ref
   */
  setRefWidth = ( node, ref ) => {
    if ( node ) {
      this.setState( prevState => {
        if ( !prevState[`${ref}Width`] ) {
          return ( {
            [`${ref}Width`]: Math.ceil( node.offsetWidth )
          } );
        }
      } );
    }
  }

  resetWidths = () => {
    if ( this._isMounted ) {
      this.setState( {
        cellWidth: null,
        fileNameWidth: null
      } );
    }
  }

  isLongName = ( itemWidth, reference, proportion ) => (
    itemWidth >= this.getProportionalNumber( reference, proportion )
  );

  handleChange = ( e, { name, value } ) => {
    /**
     * @todo need to first add `use` field to `SupportFile`
     * type in GraphQL datamodel & update type resolver
     * for the use field.
     */
    const mockUpdateFileUse = args => (
      console.log( 'updateFileUse', { ...args } )
    );

    const { file: { id }, updateLanguage /* updateFileUse */ } = this.props;

    let type = 'language';
    let updateFn = updateLanguage;
    if ( name === 'fileUse' ) {
      type = 'use';
      updateFn = mockUpdateFileUse;
    }

    this.setState(
      { [name]: value },
      () => updateFn( {
        variables: {
          data: {
            [type]: {
              connect: {
                id: this.state[name]
              }
            }
          },
          where: { id }
        }
      } )
    );
  }

  handleReplaceFile = () => {
    console.log( 'replace file' );
    this.addReplaceFileRef.click();
  }

  handleDeleteFile = () => {
    const { file: { id }, deleteFile } = this.props;
    deleteFile( { variables: { id } } );
  }

  renderIcons = () => {
    const { fileExtensions } = this.props;
    const isSingleType = fileExtensions.length === 1;
    const acceptedTypes = isSingleType ? fileExtensions[0] : '';

    return (
      <Button.Group basic size="large">
        <Popup
          content="Replace"
          size="mini"
          inverted
          on={ [
            'hover',
            'click',
            'focus'
          ] }
          trigger={ (
            <Button
              className="replace"
              icon="refresh"
              onClick={ this.handleReplaceFile }
              basic
              aria-label="replace file"
            />
          ) }
        />
        <VisuallyHidden>
          { /* eslint-disable jsx-a11y/label-has-for */
            /* eslint-disable jsx-a11y/label-has-associated-control */ }
          <label htmlFor="upload-file--single">upload file</label>
          <input
            id="upload-file--single"
            ref={ this.setReplaceFileRef }
            type="file"
            accept={ acceptedTypes }
            tabIndex={ -1 }
          />
        </VisuallyHidden>
        <Popup
          content="Delete"
          size="mini"
          inverted
          on={ [
            'hover',
            'click',
            'focus'
          ] }
          trigger={ (
            <Button
              className="delete"
              icon="delete"
              onClick={ this.handleDeleteFile }
              basic
              aria-label="delete file"
            />
          ) }
        />
      </Button.Group>
    );
  }

  renderFileUse = () => {
    const { file: { filename, filetype, id } } = this.props;
    if ( filetype === 'jpg' || filetype === 'png' ) {
      return (
        <Fragment>
          { /* eslint-disable jsx-a11y/label-has-for */ }
          <VisuallyHidden>
            <label htmlFor={ `use-${id}` }>
              { `${filename} use` }
            </label>
          </VisuallyHidden>

          <Dropdown
            id={ `use-${id}` }
            name="fileUse"
            onChange={ this.handleChange }
            options={ imageUses }
            value={ this.state.fileUse }
            fluid
            required
            selection
          />
        </Fragment>
      );
    }
    return 'Not Applicable';
  }

  render() {
    const { file, file: { filename, filetype, id } } = this.props;

    if ( !file || !Object.keys( file ).length ) return null;

    const { cellWidth, fileNameWidth, fileLanguageId } = this.state;

    const charIndex = this.getProportionalNumber( fileNameWidth, this.STR_INDEX_PROPORTION );

    const shortFileName = this.getShortFileName( filename, charIndex );

    const isLongFileName = this.isLongName( fileNameWidth, cellWidth, this.ITEM_NAME_PROPORTION );

    const popupStyle = {
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      msWordBreak: 'break-all',
      wordBreak: 'break-word'
    };

    return (
      <Table.Row>
        <Table.Cell>
          <div
            className="file-name"
            ref={ node => this.setRefWidth( node, 'cell' ) }
          >
            { isLongFileName && <VisuallyHidden>{ filename }</VisuallyHidden> }
            <span
              className={
                `file-name-wrap${isLongFileName ? ' hasEllipsis' : ''}`
              }
              aria-hidden={ isLongFileName }
              ref={ node => this.setRefWidth( node, 'fileName' ) }
            >
              { isLongFileName
                ? (
                  <Popup
                    trigger={ (
                      <span>
                        <Focusable>{ shortFileName }</Focusable>
                      </span>
                    ) }
                    content={ filename }
                    on={ [
                      'hover', 'click', 'focus'
                    ] }
                    inverted
                    size="mini"
                    style={ popupStyle }
                  />
                )
                : filename }
            </span>
          </div>
        </Table.Cell>

        <Table.Cell>
          { /* eslint-disable jsx-a11y/label-has-for */ }
          <VisuallyHidden>
            <label htmlFor={ `file-${id}` }>
              { `${filename} language` }
            </label>
          </VisuallyHidden>

          <Dropdown
            id={ `file-${id}` }
            name="fileLanguageId"
            onChange={ this.handleChange }
            options={ this.props.languages }
            value={ fileLanguageId }
            fluid
            required
            selection
          />
        </Table.Cell>

        { filetype !== 'srt'
          && <Table.Cell>{ this.renderFileUse() }</Table.Cell> }

        <Table.Cell>{ this.renderIcons() }</Table.Cell>
      </Table.Row>
    );
  }
}

EditSupportFileRow.propTypes = {
  file: object.isRequired,
  fileExtensions: array,
  languages: array.isRequired,
  updateLanguage: func,
  deleteFile: func
};

const DELETE_SUPPORT_FILE_MUTATION = gql`
  mutation DeleteSupportFile($id: ID!) {
    deleteSupportFile(id: $id) {
      id
      filename
    }
  }
`;

const UPDATE_SUPPORT_FILE_LANGUAGE_MUTATION = gql`
  mutation UpdateSupportFileLanguage($data: SupportFileUpdateInput!
  $where: SupportFileWhereUniqueInput!) {
    updateSupportFile(data: $data, where: $where) {
      id
      filename
      filetype
      language {
        id
        displayName
      }
    }
  }
`;

const deleteFileMutation = graphql( DELETE_SUPPORT_FILE_MUTATION, {
  name: 'deleteFile',
  options: props => ( {
    refetchQueries: [
      {
        query: SUPPORT_FILES_QUERY,
        variables: { id: props.projectId }
      }
    ]
  } ),
} );

const updateFileLanguageMutation = graphql( UPDATE_SUPPORT_FILE_LANGUAGE_MUTATION, {
  name: 'updateLanguage'
} );

export default compose(
  updateFileLanguageMutation,
  deleteFileMutation
)( EditSupportFileRow );

export {
  DELETE_SUPPORT_FILE_MUTATION,
  UPDATE_SUPPORT_FILE_LANGUAGE_MUTATION
};
