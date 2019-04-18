/**
 *
 * MyProjects
 *
 */
import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';
import { Table } from 'semantic-ui-react';
import ApolloError from 'components/errors/ApolloError';
import User from 'components/User/User';
import ScrollableTableWithMenu from 'components/ScrollableTableWithMenu';
import TableMobileDataToggleIcon from 'components/ScrollableTableWithMenu/TableMobileDataToggleIcon';
import MyProjectPrimaryCol from './MyProjectPrimaryCol';
import DashSearch from '../../DashSearch';
import './MyProjects.scss';

const TEAM_VIDEO_PROJECTS_QUERY = gql`
  query VideoProjectsByTeam( $team: String! ) {
    videoProjects(
      where: {
        team: {
          name: $team
        }
      }
     ) {
      id
      createdAt
      updatedAt
      team {
        name
        organization
      }
      projectType
      projectTitle
      descPublic
      descInternal
      status
      visibility
      units {
        id
        title
        descPublic
        language {
          languageCode
          locale
          textDirection
          displayName
        }
        files {
          id
          language {
            languageCode
            locale
            textDirection
            displayName
          }
          filetype
          filename
          use {
            id
            name
          }
          quality
          videoBurnedInStatus
          url
          md5
          duration
          bitrate
          filesize
          dimensions {
            width
            height
          }
          stream {
            id
            site
            url
            embedUrl
          }
        }
        thumbnails {
          size
          image {
            filetype
            filename
            url
            alt
            caption
          }
        }
      }
      supportFiles {
        id
        language {
          displayName
        }
        url
        filename
        filetype
        filesize
        use {
          id
          name
        }
      }
      thumbnails {
        alt
        caption
        dimensions {
          width
          height
        }
        alt
        caption
        filename
        filetype
        url
      }
    }
  }
`;

const persistentTableHeaders = [
  { name: 'projectTitle', label: 'PROJECT TITLE' },
  { name: 'visibility', label: 'VISIBILITY' },
  { name: 'updatedAt', label: 'MODIFIED' },
  { name: 'team', label: 'TEAM' }
];

const menuItems = [
  { name: 'author', label: 'AUTHOR' },
  { name: 'categories', label: 'CATEGORIES' },
  { name: 'createdAt', label: 'DATE' },
];

const MyProjects = () => (
  <Fragment>
    <p className="myProjects_headline">
      Overview, Team Projects, Favorites, and Collections coming in future iterations!
    </p>
    <User>
      { ( { data } ) => {
        const team = ( data && data.authenticatedUser && data.authenticatedUser.team )
          ? data.authenticatedUser.team.name
          : null;

        return (
          <Query query={ TEAM_VIDEO_PROJECTS_QUERY } variables={ { team } }>
            { ( { loading, error, data: videoProjectsData } ) => {
              if ( loading ) return <p>Loading....</p>;
              if ( error ) return <ApolloError error={ error } />;

              const { videoProjects } = videoProjectsData;
              const normalizedVideoProjects = [];

              videoProjects.forEach( videoProject => {
                const normalizedProject = Object.create( {}, {
                  id: { value: videoProject.id },
                  createdAt: { value: moment( videoProject.createdAt ).format( 'MMMM DD, YYYY' ) },
                  updatedAt: { value: moment( videoProject.updatedAt ).format( 'MMMM DD, YYYY' ) },
                  projectTitle: { value: videoProject.projectTitle },
                  author: { value: videoProject.author },
                  team: { value: videoProject.team.name },
                  visibility: { value: videoProject.visibility },
                  thumbnail: {
                    value: {
                      url: videoProject.thumbnails[0].url,
                      alt: videoProject.thumbnails[0].alt
                    }
                  },
                  supportFiles: { value: videoProject.supportFiles }
                } );
                normalizedVideoProjects.push( normalizedProject );
              } );

              return (
                <ScrollableTableWithMenu
                  tableData={ normalizedVideoProjects }
                  columnMenu={ menuItems }
                  persistentTableHeaders={ persistentTableHeaders }
                  renderDashSearch={ () => <DashSearch /> }
                  renderTableBody={ ( {
                    tableHeaders,
                    selectedItems,
                    tableData
                  }, toggleItemSelection ) => (
                    <Table.Body className="myProjects">
                      { tableData.map( d => (
                        <Table.Row
                          key={ d.id }
                          className={ d.isNew ? 'myProjects_newItem' : '' }
                        >
                          { tableHeaders.map( ( header, i ) => (
                            <Table.Cell
                              data-header={ header.label }
                              key={ `${d.id}_${header.name}` }
                              className="items_table_item"
                            >
                              { i === 0 && (
                                // Table must include .primary_col div for fixed column
                                <Fragment>
                                  <div className="primary_col">
                                    <MyProjectPrimaryCol
                                      d={ d }
                                      header={ header }
                                      selectedItems={ selectedItems }
                                      toggleItemSelection={ toggleItemSelection }
                                    />
                                  </div>
                                  <TableMobileDataToggleIcon />
                                </Fragment>
                              ) }
                              { i !== 0 && (
                                <span>
                                  <div className="items_table_mobileHeader">{ header.label }</div>
                                  { d[header.name] }
                                </span>
                              ) }
                            </Table.Cell>
                          ) ) }
                        </Table.Row>
                      ) ) }
                    </Table.Body>
                  ) }
                />
              );
            } }
          </Query>
        );
      } }
    </User>
  </Fragment>
);

export default MyProjects;
export { TEAM_VIDEO_PROJECTS_QUERY };
