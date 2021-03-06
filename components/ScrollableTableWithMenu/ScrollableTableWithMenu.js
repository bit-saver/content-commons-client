/**
 *
 * ScrollableTableWithMenu
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { Table, Grid } from 'semantic-ui-react';
import { isMobile, isWindowWidthLessThanOrEqualTo } from 'lib/browser';
import TableHeader from './TableHeader/TableHeader';
import TableBody from './TableBody/TableBody';
import TableItemsDisplay from './TableItemsDisplay/TableItemsDisplay';
import TableSearch from './TableSearch/TableSearch';
import TableMenu from './TableMenu/TableMenu';
import TableActionsMenu from './TableActionsMenu/TableActionsMenu';
import TablePagination from './TablePagination/TablePagination';
import './ScrollableTableWithMenu.scss';

/* eslint-disable react/prefer-stateless-function */
class ScrollableTableWithMenu extends React.Component {
  state = {
    tableHeaders: this.props.persistentTableHeaders,
    selectedItems: new Map(),
    hasSelectedAllItems: false, // eslint-disable-line
    displayActionsMenu: false,
    column: null,
    direction: null,
    windowWidth: null,
    searchTerm: '',
    activePage: 1,
    itemsPerPage: 15,
    skip: 0
  };

  componentDidMount = () => {
    this.tableMenuSelectionsOnMobile();
    window.addEventListener( 'resize', this.tableMenuSelectionsOnResize );
  }

  componentDidUpdate = ( prevProps, prevState ) => {
    if ( prevState.itemsPerPage !== this.state.itemsPerPage ) {
      this.handleResetActivePage();
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener( 'resize', this.tableMenuSelectionsOnResize );
  }

  handleItemsPerPageChange = ( e, value ) => {
    this.setState( { itemsPerPage: value } );
  };

  handlePageChange = ( e, { activePage } ) => {
    this.setState( prevState => {
      const { itemsPerPage } = prevState;
      const skip = ( activePage * itemsPerPage ) - itemsPerPage;
      return {
        selectedItems: new Map(),
        displayActionsMenu: false,
        activePage,
        skip
      };
    } );
  };

  handleResetActivePage = () => {
    this.setState( { activePage: 1, skip: 0 } );
  }

  handleResetSelections = () => {
    this.setState(
      {
        selectedItems: new Map(),
        displayActionsMenu: false
      },
      this.handleResetActivePage
    );
  }

  handleSearchSubmit = ( e, searchTerm ) => {
    e.preventDefault();
    this.setState(
      { searchTerm: searchTerm.trim() },
      this.handleResetActivePage
    );
  }

  handleSort = clickedColumn => () => {
    const { displayActionsMenu } = this.state;

    if ( displayActionsMenu ) return;

    // Pass column, direction to TableBody so re-rendered on TableHeader click
    // Reset to first page of results after sort
    this.setState( prevState => ( {
      column: prevState.column !== clickedColumn ? clickedColumn : prevState.column,
      direction: prevState.direction === 'ascending' ? 'descending' : 'ascending'
    } ), this.handleResetActivePage );
  };

  tableMenuOnChange = e => {
    e.persist();
    const menuItem = {
      name: e.target.parentNode.dataset.propname,
      label: e.target.parentNode.dataset.proplabel
    };
    this.setState( prevState => {
      if ( prevState.tableHeaders.map( h => h.name ).includes( menuItem.name ) ) {
        return {
          tableHeaders: prevState.tableHeaders.filter( h => h.name !== menuItem.name )
        };
      }
      return { tableHeaders: [...prevState.tableHeaders, menuItem] };
    } );
  };

  tableMenuSelectionsOnResize = () => {
    ( debounce( () => {
      const { persistentTableHeaders, columnMenu } = this.props;
      const windowWidth = window.innerWidth;
      const prevWindowWidth = this.state.windowWidth;
      if ( prevWindowWidth !== '' && prevWindowWidth <= this._breakpoint && !isWindowWidthLessThanOrEqualTo( this._breakpoint ) ) {
        return this.setState( { tableHeaders: persistentTableHeaders, windowWidth } );
      }
      if ( isWindowWidthLessThanOrEqualTo( this._breakpoint ) ) {
        return this.setState( { tableHeaders: [...persistentTableHeaders, ...columnMenu], windowWidth } );
      }
      return this.setState( { windowWidth } );
    }, 500, { leading: false, trailing: true } ) )();
  }

  tableMenuSelectionsOnMobile = () => {
    if ( isMobile() ) {
      const { columnMenu } = this.props;
      this.setState( prevState => ( {
        tableHeaders: [...prevState.tableHeaders, ...columnMenu]
      } ) );
    }
  }

  toggleAllItemsSelection = e => {
    e.stopPropagation();
    const allItems = Array
      .from( document.querySelectorAll( '[data-label]' ) )
      .map( item => item.dataset.label );

    this.setState( prevState => {
      const newSelectedItems = new Map();

      allItems.forEach( item => {
        newSelectedItems.set( item, !prevState.hasSelectedAllItems );
      } );

      return ( {
        selectedItems: newSelectedItems,
        hasSelectedAllItems: !prevState.hasSelectedAllItems,
        displayActionsMenu: !prevState.hasSelectedAllItems
      } );
    } );
  }

  toggleItemSelection = ( e, data ) => {
    const isChecked = data.checked;
    this.setState( prevState => {
      const updatedSelectedItems = prevState.selectedItems.set( String( data['data-label'] ), isChecked );
      const areOtherItemsSelected = Array.from( updatedSelectedItems.values() ).includes( true );
      return {
        selectedItems: updatedSelectedItems,
        displayActionsMenu: areOtherItemsSelected
      };
    } );
  }

  render() {
    const {
      tableHeaders,
      displayActionsMenu,
      column,
      direction,
      selectedItems,
      searchTerm,
      activePage,
      itemsPerPage,
      skip,
      windowWidth
    } = this.state;

    const { columnMenu, team } = this.props;

    const variables = { team, searchTerm };

    const paginationVars = { first: itemsPerPage, skip };

    return (
      <Grid>
        <Grid.Row className="items_tableSearch">
          <TableSearch handleSearchSubmit={ this.handleSearchSubmit } />
        </Grid.Row>
        <Grid.Row className="items_tableMenus_wrapper">
          <Grid.Column mobile={ 16 } tablet={ 3 } computer={ 3 }>
            <TableActionsMenu
              displayActionsMenu={ displayActionsMenu }
              variables={ { ...variables, ...paginationVars } }
              selectedItems={ selectedItems }
              handleResetSelections={ this.handleResetSelections }
              toggleAllItemsSelection={ this.toggleAllItemsSelection }
            />
          </Grid.Column>
          <Grid.Column mobile={ 16 } tablet={ 13 } computer={ 13 } className="items_tableMenus">
            <TableItemsDisplay
              handleChange={ this.handleItemsPerPageChange }
              searchTerm={ searchTerm }
              value={ itemsPerPage }
              variables={ { ...variables, ...paginationVars } }
            />
            <TableMenu
              columnMenu={ columnMenu }
              tableMenuOnChange={ this.tableMenuOnChange }
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column className="items_table_wrapper">
            <div className="items_table">
              <Table sortable celled>
                <TableHeader
                  tableHeaders={ tableHeaders }
                  column={ column }
                  direction={ direction }
                  handleSort={ this.handleSort }
                  toggleAllItemsSelection={ this.toggleAllItemsSelection }
                  displayActionsMenu={ displayActionsMenu }
                />
                <TableBody
                  searchTerm={ searchTerm }
                  selectedItems={ selectedItems }
                  tableHeaders={ tableHeaders }
                  toggleItemSelection={ this.toggleItemSelection }
                  variables={ { ...variables, ...paginationVars } }
                  windowWidth={ windowWidth }
                  column={ column }
                  direction={ direction }
                  projectTab={ this.props.projectTab }
                />
              </Table>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column className="items_tablePagination">
            <TablePagination
              activePage={ activePage }
              handlePageChange={ this.handlePageChange }
              itemsPerPage={ itemsPerPage }
              variables={ variables }
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

ScrollableTableWithMenu.propTypes = {
  persistentTableHeaders: PropTypes.array,
  columnMenu: PropTypes.array,
  team: PropTypes.string,
  projectTab: PropTypes.string
};

export default ScrollableTableWithMenu;
