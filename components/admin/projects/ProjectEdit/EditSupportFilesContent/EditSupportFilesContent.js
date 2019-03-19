/**
 *
 * EditSupportFilesContent
 *
 */
import React from 'react';
import { func, object, string } from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Button, Form, Table } from 'semantic-ui-react';

import ModalItem from 'components/modals/ModalItem/ModalItem';
import VisuallyHidden from 'components/admin/projects/shared/VisuallyHidden/VisuallyHidden';
import Notification from 'components/admin/projects/shared/Notification/Notification';
import EditSupportFileRow from 'components/admin/projects/ProjectEdit/EditSupportFileRow/EditSupportFileRow';

import { compareValues, capitalizeFirst } from 'lib/utils';

import './EditSupportFilesContent.scss';

/* eslint-disable react/prefer-stateless-function */
class EditSupportFilesContent extends React.PureComponent {
  constructor( props ) {
    super( props );

    this.SAVE_MSG_DELAY = 2000;
    this._isMounted = false;

    this.state = {
      displaySaveMsg: false,
      hasSaved: false,
      hasUnsavedData: false,
      hasPopulatedLanguages: false,
      selectedLangValues: {}
    };
  }

  componentDidMount = () => {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  getFileExtension = str => (
    str.slice( ( Math.max( 0, str.lastIndexOf( '.' ) ) || Infinity ) )
  )

  getFileExtensions = arr => {
    const allFileExtensions = arr.reduce( ( acc, curr ) => (
      acc.concat( this.getFileExtension( curr.filename ) )
    ), [] );
    const uniqueExtensions = [...new Set( allFileExtensions )];
    return uniqueExtensions;
  }

  getFilesByType = ( files, type ) => {
    /**
     * @todo Would be better to get file types from
     * a query. Need to figure out why these nested
     * arguments don't work:
     *
       query EditSupportFiles($id: ID!) {
        project: videoProject(id: $id) {
          srt: supportFiles(where: {filetype: "srt"}, orderBy: filename_ASC) {
            id
            filetype
            filename
          }
          other: supportFiles(where: {filetype_not: "srt"}, , orderBy: filetype_ASC) {
            id
            filetype
            filename
          }
        }
      }
     */
    if ( type === 'srt' ) {
      return files
        .filter( file => file.filetype === type )
        .sort( compareValues( 'filename' ) );
    }
    return files
      .filter( file => file.filetype !== 'srt' )
      .sort( compareValues( 'filetype' ) );
  }

  handleChange = ( e, { id, value } ) => (
    this.setState(
      prevState => ( {
        hasUnsavedData: true,
        selectedLangValues: {
          ...prevState.selectedLangValues,
          [id]: capitalizeFirst( value )
        }
      } ),
      this.haveAllLangsBeenPopulated
    )
  )

  handleCancelClose = () => {
    console.log( 'cancel' );
    this.props.closeEditModal();
  }

  handleSubmit = () => {
    console.log( 'files saved' );
    this.setState(
      {
        displaySaveMsg: true,
        hasSaved: true,
        hasUnsavedData: false
      },
      () => this.delayUnmount( this.handleDisplaySaveMsg, this.saveMsgTimer, this.SAVE_MSG_DELAY )
    );
  }

  handleAddFiles = () => {
    console.log( 'add files' );
    this.addFilesInputRef.click();
  }

  handleAddFilesRef = input => {
    this.addFilesInputRef = input;
  }

  haveAllLangsBeenPopulated = () => {
    const {
      fileType,
      data: { project: { supportFiles } }
    } = this.props;

    /**
     * see @todo comment in the getFilesByType method
     */
    const files = this.getFilesByType( supportFiles, fileType );

    const { selectedLangValues } = this.state;
    const fileCount = files.length;
    const populatedLangsCount = Object.keys( selectedLangValues ).length;

    if ( fileCount === populatedLangsCount ) {
      this.setState( {
        hasPopulatedLanguages: true
      } );
    }
  }

  handleDisplaySaveMsg = () => {
    if ( this._isMounted ) {
      this.setState( { displaySaveMsg: false } );
    }
    this.saveMsgTimer = null;
  }

  delayUnmount = ( fn, timer, delay ) => {
    if ( timer ) clearTimeout( timer );
    /* eslint-disable no-param-reassign */
    timer = setTimeout( fn, delay );
  };

  renderRow = file => {
    const { id } = file;
    const { selectedLangValues } = this.state;
    const {
      fileType,
      projectId,
      data: { project: { supportFiles } }
    } = this.props;
    /**
     * see @todo comment in the getFilesByType method
     */
    const files = this.getFilesByType( supportFiles, fileType );

    return (
      <EditSupportFileRow
        key={ id }
        file={ file }
        projectId={ projectId }
        fileExtensions={ this.getFileExtensions( files ) }
        handleChange={ this.handleChange }
        selectedLanguage={ selectedLangValues[id] }
      />
    );
  }

  render() {
    const {
      fileType,
      data: {
        error,
        loading,
        project: { supportFiles }
      }
    } = this.props;

    /**
     * see @todo comment in the getFilesByType method
     */
    const files = this.getFilesByType( supportFiles, fileType );

    if ( loading ) return 'Loading the support files...';
    if ( error ) return `Error! ${error.message}`;
    if ( !files || !files.length ) return null;

    const {
      displaySaveMsg,
      hasSaved,
      hasUnsavedData,
      hasPopulatedLanguages
    } = this.state;

    const headline = fileType === 'srt'
      ? fileType.toUpperCase()
      : capitalizeFirst( fileType );

    const notificationStyles = {
      position: 'absolute',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      // match Semantic UI border-radius
      borderBottomLeftRadius: '0.28571429rem',
      borderBottomRightRadius: '0.28571429rem',
      padding: '1em 1.5em',
      fontSize: '1em'
    };

    const notificationMsg = displaySaveMsg ? 'Saved' : 'You have unsaved data';
    const saveBtnMsg = hasSaved && !hasUnsavedData ? 'Data Saved' : 'Save';

    return (
      <ModalItem
        className={ `edit-support-files ${fileType}` }
        headline={ `Edit ${headline} file${files.length > 1 ? 's' : ''} in this project` }
        textDirection="ltr"
      >

        { ( displaySaveMsg || hasUnsavedData )
          && (
            <Notification
              el="p"
              customStyles={ notificationStyles }
              msg={ notificationMsg }
            />
          ) }

        { /**
           * onSubmit prop not used because of Semantic UI
           * bug where a form inside a modal does not
           * submit when clicking enter.
           */ }
        <Form>
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={ 9 }>
                  { `${headline} File${files.length > 1 ? 's' : ''} Selected` }
                </Table.HeaderCell>
                <Table.HeaderCell width={ 4 }>
                  Language
                  <small className="msg--required"> *</small>
                </Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { files.map( this.renderRow ) }
            </Table.Body>
          </Table>

          <div className="btn-group">
            <Button
              className="cancel-close"
              content={ hasSaved ? 'Close' : 'Cancel' }
              basic
              size="tiny"
              onClick={ this.handleCancelClose }
              type="button"
            />
            <Button
              className="add-files"
              content="Add Files"
              color="blue"
              basic
              size="tiny"
              onClick={ this.handleAddFiles }
              type="button"
            />
            <VisuallyHidden>
              { /* eslint-disable jsx-a11y/label-has-for */
                /* eslint-disable jsx-a11y/label-has-associated-control */ }
              <label htmlFor="upload-file--multiple">upload files</label>
              <input
                id="upload-file--multiple"
                ref={ this.handleAddFilesRef }
                type="file"
                multiple
                tabIndex={ -1 }
              />
            </VisuallyHidden>
            <Button
              className="save"
              content={ saveBtnMsg }
              color="blue"
              size="tiny"
              disabled={ !hasPopulatedLanguages || ( hasSaved && !hasUnsavedData ) }
              onClick={ this.handleSubmit }
              type="submit"
            />
          </div>
        </Form>
      </ModalItem>
    );
  }
}

EditSupportFilesContent.propTypes = {
  data: object.isRequired,
  projectId: string.isRequired,
  fileType: string,
  closeEditModal: func
};

const SUPPORT_FILES_QUERY = gql`
  query EditSupportFiles($id: ID!) {
    project: videoProject(id: $id) {
      supportFiles {
        id
        filename
        filetype
      }
    }
  }
`;

export default graphql( SUPPORT_FILES_QUERY, {
  options: props => ( {
    variables: {
      id: props.projectId
    },
  } )
} )( EditSupportFilesContent );
export { SUPPORT_FILES_QUERY };
