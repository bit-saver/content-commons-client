import './TableBody.scss';
import { Loader, Table } from 'semantic-ui-react';
import { formatDate, getPathToS3Bucket } from 'lib/utils';
import ApolloError from 'components/errors/ApolloError';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import React from 'react';
import TableRow from 'components/ScrollableTableWithMenu/TableRow/TableRow';
import gql from 'graphql-tag';
import orderBy from 'lodash/orderBy';

const TEAM_VIDEO_PROJECTS_QUERY = gql`
  query VideoProjectsByTeam(
    $team: String!, $searchTerm: String
  ) {
    videoProjects(
      where: {
        AND: [
          { team: { name: $team } },
          {
            OR: [
              { projectTitle_contains: $searchTerm },
              { descPublic_contains: $searchTerm },
              { descInternal_contains: $searchTerm },
              {
                categories_some: {
                  translations_some: { name_contains: $searchTerm }
                }
              },
              {
                author: {
                  OR: [
                    { firstName_contains: $searchTerm },
                    { lastName_contains: $searchTerm },
                    { email_contains: $searchTerm }
                  ]
                }
              }
            ]
          }
        ]
      }
     ) {
      id
      createdAt
      updatedAt
      team {
        id
        name
        organization
      }
      author {
        id
        firstName
        lastName
      }
      projectTitle
      status
      visibility
      thumbnails {
        id
        url
        alt
      }
      categories {
        id
        translations {
          id
          name
          language {
            id
            locale
          }
        }
      }
    }
  }
`;

const getLangTaxonomies = ( array, locale = 'en-us' ) => {
  if ( !Array.isArray( array ) || !array.length ) return '';
  return (
    array.map( tax => (
      tax.translations
        .find( translation => translation.language.locale === locale )
        .name
    ) ).join( ', ' )
  );
};

const normalizeData = videoProjects => {
  const normalizedVideoProjects = [];

  videoProjects.forEach( videoProject => {
    const normalizedProject = Object.create( {}, {
      id: { value: videoProject.id },
      createdAt: { value: formatDate( videoProject.createdAt ) },
      updatedAt: { value: formatDate( videoProject.updatedAt ) },
      projectTitle: { value: videoProject.projectTitle },
      author: { value: `${videoProject.author ? videoProject.author.firstName : ''} ${videoProject.author ? videoProject.author.lastName : ''}` },
      team: { value: videoProject.team ? videoProject.team.name : '' },
      status: { value: videoProject.status },
      visibility: { value: videoProject.visibility },
      thumbnail: {
        value: {
          url: videoProject.thumbnails && videoProject.thumbnails.length ? `${getPathToS3Bucket()}/${videoProject.thumbnails[0].url}` : '',
          alt: videoProject.thumbnails && videoProject.thumbnails.length ? videoProject.thumbnails[0].alt : ''
        }
      },
      categories: { value: getLangTaxonomies( videoProject.categories ) }
    } );
    normalizedVideoProjects.push( normalizedProject );
  } );

  return normalizedVideoProjects;
};

const TableBody = props => {
  const {
    searchTerm,
    selectedItems,
    tableHeaders,
    toggleItemSelection,
    variables,
    projectTab
  } = props;

  return (
    <Query
      query={ TEAM_VIDEO_PROJECTS_QUERY }
      variables={ { ...variables } }
      fetchPolicy="cache-and-network"
    >
      { ( { loading, error, data } ) => {
        if ( loading ) {
          return (
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Loader active inline size="small" />
                  <span style={ { marginLeft: '0.5em', fontSize: '1.5em' } }>
                    Loading...
                  </span>
                </Table.Cell>
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

        if ( data && !data.videoProjects ) return null;

        const { videoProjects } = data;

        if ( searchTerm && !videoProjects.length ) {
          return (
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  No results for &ldquo;{ searchTerm }&rdquo;
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          );
        }

        if ( !videoProjects.length ) {
          return (
            <Table.Body>
              <Table.Row>
                <Table.Cell>No projects</Table.Cell>
              </Table.Row>
            </Table.Body>
          );
        }

        // Sort data by clicked column & direction
        // Default sort by createdAt & DESC
        const direction = props.direction ? `${props.direction === 'ascending' ? 'asc' : 'desc'}` : 'desc';

        const tableData = orderBy(
          normalizeData( videoProjects ),
          tableDatum => {
            let { column } = props;
            if ( !column ) column = 'createdAt';
            // Sort by parsed Date instead of String
            if ( column === 'createdAt' || column === 'updatedAt' ) {
              return Date.parse( tableDatum[column] );
            }
            // Format table data for case insensitive sorting
            const formattedTableDatum = tableDatum[column].toString().toLowerCase();
            return formattedTableDatum;
          },
          [direction]
        );

        // skip & first query vars are used as start/end slice() params to paginate tableData on client
        const { skip, first } = variables;
        const paginatedTableData = tableData.slice( skip, skip + first );

        return (
          <Table.Body className="projects">
            { paginatedTableData.map( d => (
              <TableRow
                key={ d.id }
                d={ d }
                selectedItems={ selectedItems }
                tableHeaders={ tableHeaders }
                toggleItemSelection={ toggleItemSelection }
                projectTab={ projectTab }
              />
            ) ) }
          </Table.Body>
        );
      } }
    </Query>
  );
};

TableBody.propTypes = {
  searchTerm: PropTypes.string,
  selectedItems: PropTypes.object,
  tableHeaders: PropTypes.array,
  toggleItemSelection: PropTypes.func,
  variables: PropTypes.object,
  direction: PropTypes.string,
  projectTab: PropTypes.string
};

export default TableBody;
export { TEAM_VIDEO_PROJECTS_QUERY };
