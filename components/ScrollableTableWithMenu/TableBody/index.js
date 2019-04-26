import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';
import { Table } from 'semantic-ui-react';
import ApolloError from 'components/errors/ApolloError';
import MyProjectPrimaryCol from 'components/admin/Dashboard/MyProjects/MyProjectPrimaryCol';
import TableMobileDataToggleIcon from 'components/ScrollableTableWithMenu/TableMobileDataToggleIcon';

const TEAM_VIDEO_PROJECTS_QUERY = gql`
  query VideoProjectsByTeam( $team: String!, $first: Int ) {
    videoProjects(
      where: {
        team: {
          name: $team
        }
      },
      first: $first
     ) {
      id
      createdAt
      updatedAt
      team {
        name
        organization
      }
      author {
        firstName
        lastName
      }
      projectTitle
      visibility
      thumbnails {
        url
        alt
        caption
        filename
        filetype
        dimensions {
          width
          height
        }                
      }      
    }
  }
`;

const normalizeData = videoProjects => {
  const normalizedVideoProjects = [];

  videoProjects.forEach( videoProject => {
    const normalizedProject = Object.create( {}, {
      id: { value: videoProject.id },
      createdAt: { value: moment( videoProject.createdAt ).format( 'MMMM DD, YYYY' ) },
      updatedAt: { value: moment( videoProject.updatedAt ).format( 'MMMM DD, YYYY' ) },
      projectTitle: { value: videoProject.projectTitle },
      author: { value: `${videoProject.author ? videoProject.author.firstName : ''} ${videoProject.author ? videoProject.author.lastName : ''}` },
      team: { value: videoProject.team.name },
      visibility: { value: videoProject.visibility },
      thumbnail: {
        value: {
          url: videoProject.thumbnails[0].url,
          alt: videoProject.thumbnails[0].alt
        }
      }
    } );
    normalizedVideoProjects.push( normalizedProject );
  } );

  return normalizedVideoProjects;
};

const TableBody = props => {
  const {
    selectedItems, tableHeaders, toggleItemSelection, variables
  } = props;
  return (
    <Query
      query={ TEAM_VIDEO_PROJECTS_QUERY }
      variables={ { ...variables } }
    >
      { ( { loading, error, data: { videoProjects } } ) => {
        if ( loading ) {
          return (
            <Table.Body>
              <Table.Row>
                <Table.Cell>Loading....</Table.Cell>
              </Table.Row>
            </Table.Body>
          );
        }
        if ( error ) {
          return (
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <ApolloError error={ error } />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          );
        }
        if ( !videoProjects ) return null;

        const tableData = normalizeData( videoProjects );

        return (
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
                    { i === 0
                      ? (
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
                      )
                      : (
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
        );
      } }
    </Query>
  );
};

TableBody.propTypes = {
  selectedItems: PropTypes.object,
  tableHeaders: PropTypes.array,
  toggleItemSelection: PropTypes.func,
  variables: PropTypes.object
};

export default TableBody;
export { TEAM_VIDEO_PROJECTS_QUERY };
