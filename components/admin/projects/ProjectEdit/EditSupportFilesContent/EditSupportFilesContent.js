/**
 *
 * EditSupportFilesContent
 *
 */
import React from 'react';
import { func, object, string } from 'prop-types';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { Button, Form, Table } from 'semantic-ui-react';

import ModalItem from 'components/modals/ModalItem/ModalItem';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';
import EditSupportFileRow from 'components/admin/projects/ProjectEdit/EditSupportFileRow/EditSupportFileRow';

import { compareValues, capitalizeFirst } from 'lib/utils';

import './EditSupportFilesContent.scss';

/* eslint-disable react/prefer-stateless-function */
class EditSupportFilesContent extends React.PureComponent {
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

  handleCancelClose = () => {
    console.log( 'cancel' );
    this.props.closeEditModal();
  }

  handleAddFiles = () => {
    console.log( 'add files' );
    this.addFilesInputRef.click();
  }

  handleAddFilesRef = input => {
    this.addFilesInputRef = input;
  }

  renderRow = file => {
    const {
      fileType,
      projectId,
      LanguagesQuery: { languages },
      SupportFilesQuery: { project: { supportFiles } }
    } = this.props;

    /**
     * see @todo comment in the getFilesByType method
     */
    const files = this.getFilesByType( supportFiles, fileType );

    return (
      <EditSupportFileRow
        key={ file.id }
        file={ file }
        projectId={ projectId }
        languages={ languages }
        fileExtensions={ this.getFileExtensions( files ) }
      />
    );
  }

  render() {
    if ( !this.props.LanguagesQuery.languages || !this.props.SupportFilesQuery.project ) {
      return null;
    }

    const {
      fileType,
      LanguagesQuery,
      SupportFilesQuery,
      SupportFilesQuery: { project: { supportFiles } }
    } = this.props;

    /**
     * see @todo comment in the getFilesByType method
     */
    const files = this.getFilesByType( supportFiles, fileType );

    const isSrt = fileType === 'srt';

    if ( LanguagesQuery.loading || SupportFilesQuery.loading ) return 'Loading...';

    if ( LanguagesQuery.error ) return `Error! ${LanguagesQuery.error.message}`;
    if ( SupportFilesQuery.error ) return `Error! ${SupportFilesQuery.error.message}`;

    if ( !files || !files.length ) return null;

    const headline = isSrt
      ? fileType.toUpperCase()
      : capitalizeFirst( fileType );

    return (
      <ModalItem
        className={ `edit-support-files ${fileType}` }
        headline={ `Edit ${headline} file${files.length > 1 ? 's' : ''} in this project` }
        textDirection="ltr"
      >
        <Form>
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={ isSrt ? 9 : 7 }>
                  { `${headline} File${files.length > 1 ? 's' : ''} Selected` }
                </Table.HeaderCell>
                <Table.HeaderCell width={ 4 }>
                  Language
                  <small className="msg--required"> *</small>
                </Table.HeaderCell>

                { !isSrt
                  && (
                    <Table.HeaderCell width={ 4 }>
                      Type/Use
                      <small className="msg--required"> *</small>
                    </Table.HeaderCell>
                  ) }

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
              content="Cancel"
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
          </div>
        </Form>
      </ModalItem>
    );
  }
}

EditSupportFilesContent.propTypes = {
  LanguagesQuery: object.isRequired,
  SupportFilesQuery: object.isRequired,
  projectId: string.isRequired,
  fileType: string,
  closeEditModal: func
};

const LANGUAGES_QUERY = gql`
  query Languages($orderBy: LanguageOrderByInput) {
    languages(orderBy: $orderBy) {
      value: id
      text: displayName
    }
  }
`;

const SUPPORT_FILES_QUERY = gql`
  query SupportFiles($id: ID!) {
    project: videoProject(id: $id) {
      supportFiles {
        id
        filename
        filetype
        language {
          id
          displayName
        }
      }
    }
  }
`;

const languagesQuery = graphql( LANGUAGES_QUERY, {
  name: 'LanguagesQuery',
  options: {
    variables: { orderBy: 'displayName_ASC' }
  }
} );

const supportFilesQuery = graphql( SUPPORT_FILES_QUERY, {
  name: 'SupportFilesQuery',
  options: props => ( {
    variables: {
      id: props.projectId
    }
  } )
} );

export default compose(
  languagesQuery,
  supportFilesQuery
)( EditSupportFilesContent );

export { LANGUAGES_QUERY, SUPPORT_FILES_QUERY };
