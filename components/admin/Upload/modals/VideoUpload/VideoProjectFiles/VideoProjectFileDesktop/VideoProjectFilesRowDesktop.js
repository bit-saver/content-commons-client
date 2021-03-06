import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import LanguageDropdown from 'components/admin/dropdowns/LanguageDropdown';
import VideoBurnedInStatusDropdown from 'components/admin/dropdowns/VideoBurnedInStatusDropdown';
import UseDropdown from 'components/admin/dropdowns/UseDropdown';
import QualityDropdown from 'components/admin/dropdowns/QualityDropdown';
import FileRemoveReplaceButtonGroup from 'components/admin/FileRemoveReplaceButtonGroup/FileRemoveReplaceButtonGroup';
import { truncateAndReplaceStr } from 'lib/utils';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';
import Notification from 'components/Notification/Notification';
import UploadCompletionTracker from '../UploadCompletionTracker';
import { VideoUploadContext } from '../../VideoUpload';
import './VideoProjectFilesRowDesktop.scss';

// Optimize re-renders as component could potentially have many rows
const areEqual = ( prevProps, nextProps ) => {
  // if activeStep changes, rerender the row
  if ( prevProps.activeStep !== nextProps.activeStep ) {
    return false;
  }

  const nextFile = nextProps.file;

  // if on same step, check for prop differences
  const entries = Object.entries( prevProps.file );
  const same = entries.every( ( [prop, value] ) => {
    if ( prop === 'id' ) {
      return true;
    }
    return nextFile[prop] === value;
  } );
  return same;
};

const VideoProjectFilesDesktopRow = props => {
  const {
    show, activeStep, file: {
      id, language, videoBurnedInStatus, use, quality, input: { name, type }
    }
  } = props;

  // extract file type, i.e. get 'image' from the incoming type 'image/*' for example
  // item in first index shows the first capturing group in regex
  let fileType = /(\w+)\/(\w+)/.exec( type );
  fileType = ( fileType ) ? fileType[1] : '';
  const filename = ( name.length > 25 ) ? truncateAndReplaceStr( name, 15, 8 ) : name;

  /**
   * Figure out how many dropdowns need to be tracked for completion for each step
   * @param {number} step active step
   */
  const getFields = step => {
    if ( step === 1 ) {
      switch ( fileType ) {
        case 'video':
          return [language, videoBurnedInStatus];
        default:
          return [language];
      }
    } else {
      switch ( fileType ) {
        case 'video':
          return [use, quality];
        default:
          return [];
      }
    }
  };

  /**
   * Toggles trackers display based on activeStep
   * Not using show() as need to use !important in css rule
   * @param {number} step current step
   */
  const displayTracker = step => ( activeStep === step ? 'show' : 'hide' );

  const renderNotApplicable = () => (
    <div className="videoProjectFilesDesktopRow__column--not-applicable">
      Not Applicable
    </div>
  );

  return (
    <VideoUploadContext.Consumer>
      {
        ( {
          replaceAssetFile,
          removeAssetFile,
          updateField,
          duplicateFiles,
          setDuplicateFiles
        } ) => (
          <Grid.Row className="videoProjectFilesDesktopRow">

            { /* Filename */ }
            <Grid.Column width={ 6 } className="videoProjectFilesDesktopRow__column">
              <div className="videoProjectFilesDesktopRow__column--filename">
                <UploadCompletionTracker fields={ getFields( 1 ) } display={ displayTracker( 1 ) } />
                <UploadCompletionTracker fields={ getFields( 2 ) } display={ displayTracker( 2 ) } />
                <span className="item-text" aria-hidden>
                  { filename }
                  <span className="item-text--hover">{ name }</span>
                </span>
                <VisuallyHidden el="span">{ name }</VisuallyHidden>
                { duplicateFiles.includes( name ) && (
                  <Notification
                    el="div"
                    show
                    msg="This file has already been added."
                    customStyles={
                      {
                        display: 'inline-block',
                        position: 'absolute',
                        bottom: '-0.3em',
                        left: '4em',
                        padding: '0',
                        backgroundColor: 'none',
                        color: '#DB2828'
                      }
                    }
                  />
                ) }
              </div>
            </Grid.Column>

            { /* Language */ }
            <Grid.Column width={ 4 } style={ show( 1 ) }>
              <LanguageDropdown id={ id } value={ language } onChange={ updateField } required />
            </Grid.Column>

            { /* VideoBurnedInStatus */ }
            <Grid.Column width={ 4 } style={ show( 1 ) }>
              { fileType === 'video'
                ? <VideoBurnedInStatusDropdown id={ id } value={ videoBurnedInStatus } onChange={ updateField } required />
                : renderNotApplicable()
              }
            </Grid.Column>

            { /* Type/Use */ }
            <Grid.Column width={ 4 } style={ show( 2 ) }>
              { ( fileType === 'video' || fileType === 'image' )
                ? <UseDropdown id={ id } value={ use } type={ fileType } onChange={ updateField } />
                : renderNotApplicable()
              }
            </Grid.Column>

            { /* Quality */ }
            <Grid.Column width={ 4 } style={ show( 2 ) }>
              { fileType === 'video'
                ? <QualityDropdown id={ id } type={ fileType } value={ quality } onChange={ updateField } />
                : renderNotApplicable()
              }
            </Grid.Column>

            { /* Actions */ }
            <Grid.Column width={ 2 } only="tablet computer">
              <FileRemoveReplaceButtonGroup
                onReplace={ e => {
                  setDuplicateFiles( [] );
                  replaceAssetFile( id, e.target.files[0] );
                } }
                onRemove={ () => {
                  setDuplicateFiles( [] );
                  removeAssetFile( id );
                } }
              />
            </Grid.Column>
          </Grid.Row>
        )
       }
    </VideoUploadContext.Consumer>
  );
};


VideoProjectFilesDesktopRow.propTypes = {
  file: PropTypes.shape( {
    id: PropTypes.string,
    language: PropTypes.string,
    videoBurnedInStatus: PropTypes.string,
    use: PropTypes.string,
    quality: PropTypes.string,
    input: PropTypes.object
  } ),
  activeStep: PropTypes.number,
  show: PropTypes.func
};


export default React.memo( VideoProjectFilesDesktopRow, areEqual );
