/**
 *
 * FileDataForm
 *
 */
import React, { Component } from 'react';
import propTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Confirm, Form, Grid } from 'semantic-ui-react';

import ConfirmModalContent from 'components/admin/ConfirmModalContent/ConfirmModalContent';
import IconPopup from 'components/popups/IconPopup/IconPopup';
import LanguageDropdown from 'components/admin/dropdowns/LanguageDropdown';
import Loader from 'components/admin/projects/ProjectEdit/EditVideoModal/Loader/Loader';
import QualityDropdown from 'components/admin/dropdowns/QualityDropdown';
import UseDropdown from 'components/admin/dropdowns/UseDropdown';
import VideoBurnedInStatusDropdown from 'components/admin/dropdowns/VideoBurnedInStatusDropdown';
import { formatBytes, formatDate } from 'lib/utils';

import { VIDEO_UNIT_QUERY } from 'components/admin/projects/ProjectEdit/EditVideoModal/ModalSections/FileSection/FileSection';
import {
  VIDEO_PROJECT_QUERY, VIDEO_FILE_QUERY, VIDEO_FILE_LANG_MUTATION, VIDEO_UNIT_CONNECT_FILE_MUTATION,
  VIDEO_UNIT_DISCONNECT_FILE_MUTATION, VIDEO_FILE_SUBTITLES_MUTATION, VIDEO_FILE_USE_MUTATION,
  VIDEO_FILE_QUALITY_MUTATION, VIDEO_FILE_CREATE_STREAM_MUTATION, VIDEO_FILE_UPDATE_STREAM_MUTATION,
  VIDEO_FILE_DELETE_STREAM_MUTATION, VIDEO_FILE_DELETE_MUTATION
} from './FileDataFormQueries';
import './FileDataForm.scss';

class FileDataForm extends Component {
  state = {
    deleteConfirmOpen: false
  }

  componentDidUpdate = prevProps => {
    const { file } = this.props.videoFileQuery;

    if ( file && file !== prevProps.videoFileQuery.file ) {
      const use = file.use && file.use.id ? file.use.id : '';
      const language = file.language && file.language.id ? file.language.id : '';

      this.setState( {
        language,
        quality: file.quality || '',
        streams: this.getStreamObjects( file.stream ),
        videoBurnedInStatus: file.videoBurnedInStatus || '',
        use
      } );
    }
  }

  // Iterates through an array of units to return an array of locales (one for each unit)
  getLocales = arr => {
    const locales = [];
    if ( Array.isArray( arr ) && arr.length > 0 ) {
      arr.forEach( unit => {
        if ( unit.language && unit.language.locale ) {
          locales.push( unit.language.locale );
        }
        return locales;
      } );
    }
    return locales;
  }

  getStreamObjects = streamList => {
    const streams = [];

    if ( streamList && streamList.length > 0 ) {
      streamList.forEach( stream => {
        if ( stream.site === 'youtube' || stream.site === 'vimeo' ) {
          const obj = {
            [stream.site]: {
              id: stream.id,
              url: stream.url
            }
          };
          streams.push( obj );
          return streams;
        }
      } );
    }

    const streamObj = streams.reduce( ( obj, item ) => {
      const key = Object.keys( item )[0];
      obj[key] = item[key];
      return obj;
    }, {} );

    return streamObj;
  }

  // Runs GraphQl mutation and updates the cache after a dropdown selection
  updateUnit = ( name, value ) => {
    const { selectedFile } = this.props;

    this.props[`${name}VideoFileMutation`]( {
      variables: {
        id: selectedFile,
        [name]: value
      },
      update: ( cache, { data: { updateVideoFile } } ) => {
        try {
          const cachedData = cache.readQuery( {
            query: VIDEO_FILE_QUERY,
            variables: { id: selectedFile }
          } );

          if ( name === 'use' ) {
            cachedData.file.use.id = value;
          } else {
            cachedData.file[name] = value;
          }

          cache.writeQuery( {
            query: VIDEO_FILE_QUERY,
            data: { file: cachedData.file }
          } );
        } catch ( error ) {
          console.log( error );
        }
      }
    } );
  }

  updateStreams = e => {
    const unitId = this.props.selectedFile;
    const { name } = e.target;
    const { streams } = this.state;

    if ( streams[name] ) {
      const { url } = streams[name];
      const streamId = streams[name].id;

      if ( streamId && url !== '' ) {
        this.props.streamUpdateVideoFileMutation( {
          variables: {
            id: unitId,
            streamId,
            url
          }
        } );
      } else if ( streamId && url === '' ) {
        this.props.streamDeleteVideoFileMutation( {
          variables: {
            id: unitId,
            streamId
          }
        } );
      } else {
        this.props.streamCreateVideoFileMutation( {
          variables: {
            id: unitId,
            site: name,
            url
          }
        } );
      }
    }

    this.props.videoFileQuery.refetch();
  }

  handleStreamsInputChange = e => {
    const { name, value } = e.target;
    this.setState( prevState => ( {
      streams: {
        ...prevState.streams,
        [name]: {
          ...prevState.streams[name],
          url: value
        }
      }
    } ) );
  }

  handleDropdownSave = ( e, data ) => {
    const { name, value } = data;

    this.setState(
      { [name]: value },
      () => this.updateUnit( name, value )
    );
  }

  handleLanguageChange = ( e, data ) => {
    const {
      language, languageVideoFileMutation, selectedFile, selectedUnit, updateSelectedUnit,
      videoProjectQuery, videoUnitConnectFileMutation, videoUnitDisconnectFileMutation
    } = this.props;
    const { project } = videoProjectQuery && videoProjectQuery.project ? videoProjectQuery : {};

    // Get array of units and the language they are in
    const unitsByLang = [];
    if ( project.units ) {
      project.units.forEach( unit => {
        unitsByLang.push( { unitId: unit.id, langId: unit.language.id } );
        return unitsByLang;
      } );
    }

    const selectedLang = data.value;
    const newUnit = unitsByLang.filter( unit => unit.langId === selectedLang );

    if ( selectedLang && selectedLang !== language.id ) {
      // Update file language
      languageVideoFileMutation( {
        variables: {
          id: selectedFile,
          language: selectedLang
        }
      } );
      // Disconnect File from old language unit
      videoUnitDisconnectFileMutation( {
        variables: {
          id: selectedUnit,
          fileId: selectedFile
        },
        update: ( cache, { data: { updateVideoUnit } } ) => {
          try {
            const cachedData = cache.readQuery( {
              query: VIDEO_UNIT_QUERY,
              variables: { id: selectedUnit }
            } );

            const newFiles = cachedData.unit.files.filter( file => file.id !== selectedFile );
            cachedData.unit.files = newFiles;

            cache.writeQuery( {
              query: VIDEO_UNIT_QUERY,
              data: { unit: cachedData.unit }
            } );
          } catch ( error ) {
            console.log( error );
          }
        }
      } );
      // Connect file to new unit
      videoUnitConnectFileMutation( {
        variables: {
          id: newUnit[0].unitId,
          fileId: selectedFile
        }
      } );

      updateSelectedUnit( newUnit[0].unitId );
    }
  }

  displayConfirmDelete = () => {
    this.setState( { deleteConfirmOpen: true } );
  }

  handleDeleteConfirm = () => {
    const { selectedFile, selectedUnit, updateSelectedFile } = this.props;

    this.props.deleteVideoFileMutation( {
      variables: { id: selectedFile },
      update: ( cache, { data: { deleteVideoFile } } ) => {
        try {
          const cachedData = cache.readQuery( {
            query: VIDEO_UNIT_QUERY,
            variables: { id: selectedUnit }
          } );

          const newFiles = cachedData.unit.files.filter( file => file.id !== selectedFile );
          cachedData.unit.files = newFiles;

          cache.writeQuery( {
            query: VIDEO_UNIT_QUERY,
            data: { unit: cachedData.unit }
          } );

          console.log( `Deleted video: ${selectedFile}` );

          const newSelectedFile = cachedData.unit.files && cachedData.unit.files[0] && cachedData.unit.files[0].id
            ? cachedData.unit.files[0].id
            : '';
          updateSelectedFile( newSelectedFile );
        } catch ( error ) {
          console.log( error );
        }
      }
    } );
    this.setState( { deleteConfirmOpen: false } );
  }

  handleDeleteCancel = () => {
    this.setState( { deleteConfirmOpen: false } );
  }

  render() {
    const videoQuality = (
      <label htmlFor="video-quality"> { /* eslint-disable-line */ }
        Video Quality
        <IconPopup
          iconSize="small"
          iconType="info circle"
          id="video-quality"
          message="Web: small - for social sharing, Broadcast: large - ambassador videos"
          popupSize="small"
        />
      </label>
    );

    const { file, loading } = this.props.videoFileQuery;
    const { project } = this.props.videoProjectQuery;

    if ( !file || loading ) return <Loader height="330px" text="Loading the file data..." />;

    const {
      deleteConfirmOpen, language, quality, streams, use, videoBurnedInStatus
    } = this.state;

    const width = file.dimensions && file.dimensions.width ? file.dimensions.width : '';
    const height = file.dimensions && file.dimensions.height ? file.dimensions.height : '';
    const dimensions = width && height ? `Dimensions: ${width} x ${height}` : '';
    const youtube = streams && streams.youtube ? streams.youtube : {};
    const vimeo = streams && streams.vimeo ? streams.vimeo : {};

    const units = project && project.units ? project.units : [];

    return (
      <Form className="edit-video__form video-file-form" style={ { overflow: 'hidden' } }>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column className="video-file-form-col-1" mobile={ 16 } computer={ 8 }>
              <div className="file_meta">
                <span className="file_meta_content file_meta_content--filetype">
                  { file.filename }
                </span>
                <span className="file_meta_content file_meta_content--filesize">
                  { `Filesize: ${formatBytes( file.filesize || 0 )}` }
                </span>
                <span className="file_meta_content file_meta_content--dimensions">
                  { dimensions }
                </span>
                <span className="file_meta_content file_meta_content--uploaded">
                  { `Uploaded: ${formatDate( file.createdAt )}` }
                </span>
                <span className="file_meta_content file_meta_content--duration">
                  { `Duration: ${file.duration}` }
                </span>
                <span className="delete-file-link" onClick={ this.displayConfirmDelete } onKeyUp={ this.displayConfirmDelete } role="button" tabIndex={ 0 }>
                  Delete file from project
                </span>
              </div>

              <Confirm
                className="delete"
                open={ deleteConfirmOpen }
                content={ (
                  <ConfirmModalContent
                    className="delete_confirm delete_confirm--video"
                    headline="Are you sure you want to delete this video?"
                  >
                    <p>This video will be permanently removed from the Content Commons and any other projects or collections it appears on.</p>
                  </ConfirmModalContent>
                ) }
                onCancel={ this.handleDeleteCancel }
                onConfirm={ this.handleDeleteConfirm }
                cancelButton="No, take me back"
                confirmButton="Yes, delete forever"
              />

              <div className="video-links">
                <Form.Input
                  id="video-youtube"
                  label="YouTube URL"
                  name="youtube"
                  onBlur={ this.updateStreams }
                  onChange={ this.handleStreamsInputChange }
                  value={ youtube.url ? youtube.url : '' }
                />

                <Form.Input
                  id="video-vimeo"
                  label="Vimeo URL"
                  name="vimeo"
                  onBlur={ this.updateStreams }
                  onChange={ this.handleStreamsInputChange }
                  value={ vimeo.url ? vimeo.url : '' }
                />
              </div>
            </Grid.Column>

            <Grid.Column mobile={ 16 } computer={ 8 }>
              <LanguageDropdown
                id="video-language"
                locales={ this.getLocales( units ) }
                label="Language"
                onChange={ this.handleLanguageChange }
                required
                value={ language }
              />

              <VideoBurnedInStatusDropdown
                id="video-subtitles"
                label="Subtitles & Captions"
                onChange={ this.handleDropdownSave }
                required
                type="video"
                value={ videoBurnedInStatus }
              />

              <UseDropdown
                id="video-use"
                label="Video Type"
                onChange={ this.handleDropdownSave }
                required
                type="video"
                value={ use }
              />

              <QualityDropdown
                id="video-quality"
                label={ videoQuality }
                onChange={ this.handleDropdownSave }
                required
                type="video"
                value={ quality }
              />

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}

FileDataForm.propTypes = {
  deleteVideoFileMutation: propTypes.func,
  language: propTypes.object,
  languageVideoFileMutation: propTypes.func,
  selectedFile: propTypes.string,
  selectedUnit: propTypes.string,
  streamCreateVideoFileMutation: propTypes.func,
  streamDeleteVideoFileMutation: propTypes.func,
  streamUpdateVideoFileMutation: propTypes.func,
  updateSelectedFile: propTypes.func,
  updateSelectedUnit: propTypes.func,
  videoFileQuery: propTypes.object,
  videoUnitConnectFileMutation: propTypes.func,
  videoUnitDisconnectFileMutation: propTypes.func,
  videoProjectQuery: propTypes.object
};

export default compose(
  graphql( VIDEO_FILE_DELETE_MUTATION, { name: 'deleteVideoFileMutation' } ),
  graphql( VIDEO_FILE_DELETE_STREAM_MUTATION, { name: 'streamDeleteVideoFileMutation' } ),
  graphql( VIDEO_FILE_UPDATE_STREAM_MUTATION, { name: 'streamUpdateVideoFileMutation' } ),
  graphql( VIDEO_FILE_CREATE_STREAM_MUTATION, { name: 'streamCreateVideoFileMutation' } ),
  graphql( VIDEO_FILE_QUALITY_MUTATION, { name: 'qualityVideoFileMutation' } ),
  graphql( VIDEO_FILE_USE_MUTATION, { name: 'useVideoFileMutation' } ),
  graphql( VIDEO_FILE_SUBTITLES_MUTATION, { name: 'videoBurnedInStatusVideoFileMutation' } ),
  graphql( VIDEO_UNIT_DISCONNECT_FILE_MUTATION, { name: 'videoUnitDisconnectFileMutation' } ),
  graphql( VIDEO_UNIT_CONNECT_FILE_MUTATION, { name: 'videoUnitConnectFileMutation' } ),
  graphql( VIDEO_FILE_LANG_MUTATION, { name: 'languageVideoFileMutation' } ),
  graphql( VIDEO_FILE_QUERY, {
    name: 'videoFileQuery',
    options: props => ( {
      variables: { id: props.selectedFile },
    } )
  } ),
  graphql( VIDEO_PROJECT_QUERY, {
    name: 'videoProjectQuery',
    options: props => ( {
      variables: { id: props.selectedProject },
    } )
  } )
)( FileDataForm );
