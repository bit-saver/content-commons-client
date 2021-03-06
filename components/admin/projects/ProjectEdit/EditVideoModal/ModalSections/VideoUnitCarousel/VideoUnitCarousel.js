/**
 *
 * VideoUnitCarousel
 *
 */
import React, { useContext } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Carousel from 'components/admin/projects/ProjectEdit/EditVideoModal/Carousel/Carousel';
import Loader from 'components/admin/projects/ProjectEdit/EditVideoModal/Loader/Loader';
import { EditSingleProjectItemContext } from 'components/admin/projects/ProjectEdit/EditSingleProjectItem/EditSingleProjectItem';
import { getPathToS3Bucket } from 'lib/utils';

import './VideoUnitCarousel.scss';

const VIDEO_PROJECT_QUERY = gql`
  query VIDEO_PROJECT_QUERY( $id: ID! ) {
    project: videoProject( id: $id ) {
      id
      units {
        id
        title
        files {
          id
        }
        language {
          id
          displayName
        }
        thumbnails {
          image {
            id
            alt
            url
          }
        }
      }
    }
  }
`;

const VideoUnitCarousel = () => {
  const { selectedProject, selectedUnit, updateSelectedUnit } = useContext( EditSingleProjectItemContext );

  return (
    <section className="video-carousel-section">
      <h3 className="video-carousel-section-header">Videos in this Project</h3>
      <Query query={ VIDEO_PROJECT_QUERY } variables={ { id: selectedProject } }>
        { ( { loading, error, data } ) => {
          if ( loading || !data ) return <Loader height="300px" text="Loading video units..." />;
          if ( error ) return <p>{ `Error: ${error.message}` }</p>;

          const { project } = data;
          const units = project && project.units ? project.units : [];

          return (
            <Carousel selectedItem={ selectedUnit }>
              { units && (
                units.map( unit => {
                  const image = unit.thumbnails && unit.thumbnails[0] && unit.thumbnails[0].image ? unit.thumbnails[0].image : '';
                  const files = unit.files ? unit.files : [];
                  const selected = unit.id === selectedUnit ? 'selected' : '';

                  return (
                    <div
                      className={ `video-carousel-item ${selected}` }
                      id={ unit.id }
                      key={ unit.id }
                      onClick={ () => updateSelectedUnit( unit.id ) }
                      onKeyUp={ () => updateSelectedUnit( unit.id ) }
                      role="button"
                      selected={ selected }
                      tabIndex="0"
                    >
                      <img className={ `video-carousel-item-image ${selected}` } src={ `${getPathToS3Bucket()}/${image.url}` } alt={ image.alt } />
                      <div className="video-carousel-item-heading">
                        { `${unit.title} | ${unit.language.displayName}` }
                      </div>
                      <div className="video-carousel-item-meta">
                        { `${files.length} files` }
                      </div>
                    </div>
                  );
                } )
              ) }
            </Carousel>
          );
        } }
      </Query>
    </section>
  );
};

export default VideoUnitCarousel;
