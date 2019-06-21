/**
 *
 * PreviewProjectContent
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Dropdown, Embed, Loader } from 'semantic-ui-react';

import DownloadVideo from 'components/admin/download/DownloadVideo/DownloadVideo';
import DownloadSrt from 'components/admin/download/DownloadSrt/DownloadSrt';
import DownloadThumbnail from 'components/admin/download/DownloadThumbnail/DownloadThumbnail';
import DownloadOtherFiles from 'components/admin/download/DownloadOtherFiles/DownloadOtherFiles';
import DownloadHelp from 'components/Video/DownloadHelp';

import ModalItem from 'components/modals/ModalItem/ModalItem';
import ModalContentMeta from 'components/modals/ModalContentMeta/ModalContentMeta';
import ModalDescription from 'components/modals/ModalDescription/ModalDescription';
import ModalPostMeta from 'components/modals/ModalPostMeta/ModalPostMeta';

import Notification from 'components/Notification/Notification';
import PopupTrigger from 'components/popups/PopupTrigger';
import PopupTabbed from 'components/popups/PopupTabbed';

import downloadIcon from 'static/icons/icon_download.svg';
import {
  getPathToS3Bucket, getStreamData, getVimeoId, getYouTubeId
} from 'lib/utils';

import './PreviewProjectContent.scss';

/* eslint-disable react/prefer-stateless-function */
class PreviewProjectContent extends React.PureComponent {
  constructor( props ) {
    super( props );

    this.state = {
      dropDownIsOpen: false,
      selectedLanguage: 'English'
    };
  }

  getLanguages = units => (
    units.map( unit => ( {
      key: unit.language.languageCode,
      value: unit.language.displayName,
      text: unit.language.displayName
    } ) )
  )

  getProjectItems = units => (
    units.reduce( ( acc, unit ) => ( {
      ...acc,
      [unit.language.displayName]: unit
    } ), {} )
  );

  toggleArrow = () => {
    this.setState( prevState => ( {
      dropDownIsOpen: !prevState.dropDownIsOpen
    } ) );
  }

  selectLanguage = language => (
    this.setState( { selectedLanguage: language } )
  )

  handleChange = ( e, { value } ) => {
    this.toggleArrow();
    this.selectLanguage( value );
  }

  render() {
    const { id } = this.props;
    const { error, loading, project } = this.props.data;

    if ( loading ) {
      return (
        <div
          className="preview-project-loader"
          style={ {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px'
          } }
        >
          <Loader
            active
            inline="centered"
            style={ { marginBottom: '1em' } }
          />
          <p>Loading the project preview...</p>
        </div>
      );
    }

    if ( error ) return `Error! ${error.message}`;
    if ( !project || !Object.keys( project ).length ) return null;

    const {
      __typename, createdAt, updatedAt, team, units
    } = project;
    const { dropDownIsOpen, selectedLanguage } = this.state;

    const projectItems = this.getProjectItems( units );
    const selectedItem = projectItems[this.state.selectedLanguage];

    if ( !selectedItem || !Object.keys( selectedItem ).length ) return null;

    const {
      title,
      language,
      descPublic,
      files
    } = selectedItem;

    const currentUnit = files[0];
    const youTubeUrl = getStreamData( currentUnit.stream, 'youtube', 'url' );
    const vimeoUrl = getStreamData( currentUnit.stream, 'vimeo', 'url' );
    const { videoBurnedInStatus } = currentUnit;

    let thumbnailUrl = '';
    if ( selectedItem.thumbnails && selectedItem.thumbnails.length ) {
      thumbnailUrl = selectedItem.thumbnails[0].image.url;
    } else if ( project.thumbnails && project.thumbnails.length ) {
      thumbnailUrl = project.thumbnails[0].url;
    }

    const previewMsgStyles = {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      // match Semantic UI border-radius
      borderTopLeftRadius: '0.28571429rem',
      borderTopRightRadius: '0.28571429rem',
      padding: '1em 1.5em',
      fontSize: '1em',
      backgroundColor: '#fdb81e'
    };

    return (
      <ModalItem
        className="project-preview"
        headline={ title }
        textDirection={ language.textDirection }
      >
        <Notification
          el="p"
          show
          customStyles={ previewMsgStyles }
          msg="This is a preview of your project on Content Commons."
        />

        <div className="modal_options">
          <Dropdown
            className="modal_languages"
            value={ selectedLanguage }
            icon={ dropDownIsOpen ? 'chevron up' : 'chevron down' }
            options={ this.getLanguages( units ) }
            onClick={ this.toggleArrow }
            onChange={ this.handleChange }
          />

          <div className="trigger-container">
            <PopupTrigger
              toolTip="Download video"
              icon={ { img: downloadIcon, dim: 18 } }
              position="right"
              show={ __typename === 'VideoProject' }
              content={ (
                <PopupTabbed
                  title="Download this video."
                  panes={ [
                    {
                      title: 'Video File',
                      component: (
                        <DownloadVideo
                          selectedLanguageUnit={ selectedItem }
                          instructions={ `Download the video and SRT files in ${selectedLanguage}.
                            This download option is best for uploading this video to web pages.` }
                          burnedInCaptions={ videoBurnedInStatus === 'CAPTIONED' }
                        />
                      )
                    },
                    {
                      title: 'SRT',
                      component: (
                        <DownloadSrt
                          id={ id }
                          instructions="Download SRT(s)"
                        />
                      )
                    },
                    {
                      title: 'Thumbnail',
                      component: (
                        <DownloadThumbnail
                          id={ id }
                          instructions="Download Thumbnail(s)"
                        />
                      )
                    },
                    {
                      title: 'Other',
                      component: (
                        <DownloadOtherFiles
                          id={ id }
                          instructions="Download Other File(s)"
                        />
                      )
                    },
                    { title: 'Help', component: <DownloadHelp /> }
                  ] }
                />
              ) }
            />
          </div>
        </div>

        <div className="project-preview__content">
          { youTubeUrl && (
            <Embed
              id={ getYouTubeId( youTubeUrl ) }
              placeholder={ `${getPathToS3Bucket()}/${thumbnailUrl}` }
              source="youtube"
            />
          ) }
          { ( !youTubeUrl && vimeoUrl ) && (
            <Embed
              id={ getVimeoId( vimeoUrl ) }
              placeholder={ `${getPathToS3Bucket()}/${thumbnailUrl}` }
              source="vimeo"
            />
          ) }
          <ModalContentMeta type="video" dateUpdated={ updatedAt } />

          <ModalDescription description={ descPublic } />
        </div>

        <ModalPostMeta source={ team.name } datePublished={ createdAt } />
      </ModalItem>
    );
  }
}

PreviewProjectContent.propTypes = {
  id: PropTypes.string,
  data: PropTypes.object.isRequired,
};

const VIDEO_PROJECT_PREVIEW_QUERY = gql`
  query VideoProjectPreview($id: ID!, $isReviewPage: Boolean!) {
    project: videoProject(id: $id) {
      id
      createdAt @skip(if: $isReviewPage)
      updatedAt @skip(if: $isReviewPage)
      projectType @skip(if: $isReviewPage)
      thumbnails @skip(if: $isReviewPage) {
        id
        alt
        url
      }
      team @skip(if: $isReviewPage) {
        id
        name
      }
      units {
        id
        title
        descPublic
        thumbnails {
          id
          image {
            id
            alt
            url
          }
        }
        language @skip(if: $isReviewPage) {
          id
          languageCode
          displayName
          textDirection
        }
        files {
          id
          createdAt
          duration
          filename
          url
          use @include(if: $isReviewPage) {
            id
            name
          }
          filesize
          videoBurnedInStatus
          createdAt @include(if: $isReviewPage)
          duration @include(if: $isReviewPage)
          quality @include(if: $isReviewPage)
          dimensions {
            id
            width
            height
          }
          stream {
            id
            site
            url
          }
          language @include(if: $isReviewPage) {
            id
            displayName
            textDirection
          }
        }
      }
    }
  }
`;

export default graphql( VIDEO_PROJECT_PREVIEW_QUERY, {
  options: props => ( {
    variables: {
      id: props.id,
      isReviewPage: false
    },
  } )
} )( PreviewProjectContent );

export { VIDEO_PROJECT_PREVIEW_QUERY };
