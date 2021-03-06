import { mount } from 'enzyme';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { Checkbox } from 'semantic-ui-react';
import ApolloError from 'components/errors/ApolloError';
import TableActionsMenu from './TableActionsMenu';
import { TEAM_VIDEO_PROJECTS_QUERY } from '../TableBody/TableBody';
import { TEAM_VIDEO_PROJECTS_COUNT_QUERY } from '../TablePagination/TablePagination';
import { DELETE_VIDEO_PROJECTS_MUTATION } from './DeleteProjects/DeleteProjects';
import { UNPUBLISH_VIDEO_PROJECTS_MUTATION } from './UnpublishProjects/UnpublishProjects';

/**
 * Need to mock Next.js dynamic imports
 * in order for this test suite to run.
 */
jest.mock( 'next-server/dynamic', () => () => 'VideoDetailsPopup' );
jest.mock( 'next-server/dynamic', () => () => 'ImageDetailsPopup' );

const props = {
  displayActionsMenu: true,
  variables: {
    team: 'IIP Video Production',
    searchTerm: '',
    first: 4,
    skip: 0
  },
  selectedItems: new Map( [['ud78', true], ['ud98', true]] ),
  handleResetSelections: jest.fn(),
  toggleAllItemsSelection: jest.fn()
};

const mocks = [
  {
    request: {
      query: DELETE_VIDEO_PROJECTS_MUTATION,
      variables: {
        where: {
          id_in: [...props.selectedItems.keys()]
        }
      }
    },
    result: {
      data: {
        deleteProjects: {
          count: [...props.selectedItems.keys()].length
        }
      }
    }
  },
  {
    request: {
      query: UNPUBLISH_VIDEO_PROJECTS_MUTATION,
      variables: {
        data: { status: 'DRAFT', visibility: 'INTERNAL' },
        where: {
          AND: [
            { id_in: [...props.selectedItems.keys()] },
            { status_not: 'DRAFT' }
          ]
        }
      }
    },
    result: {
      data: {
        unpublish: {
          count: [...props.selectedItems.keys()].length
        }
      }
    }
  },
  {
    request: {
      query: TEAM_VIDEO_PROJECTS_COUNT_QUERY,
      variables: {
        team: props.variables.team,
        searchTerm: props.variables.searchTerm
      }
    },
    result: {
      data: {
        videoProjects: [
          { id: 'ud78' },
          { id: 'ud98' },
          { id: 'ud64' },
          { id: 'ud23' },
          { id: 'ud74' }
        ]
      }
    }
  },
  {
    request: {
      query: TEAM_VIDEO_PROJECTS_COUNT_QUERY,
      variables: {
        team: props.variables.team,
        searchTerm: props.variables.searchTerm
      }
    },
    result: {
      data: {
        videoProjects: [
          { id: 'ud64' },
          { id: 'ud23' }
        ]
      }
    }
  },
  {
    request: {
      query: TEAM_VIDEO_PROJECTS_QUERY,
      variables: { ...props.variables }
    },
    result: {
      data: {
        videoProjects: [
          {
            id: 'ud78',
            createdAt: '2019-05-09T18:33:03.368Z',
            updatedAt: '2019-05-09T18:33:03.368Z',
            team: {
              id: 't888',
              name: 'IIP Video Production',
              organization: 'Department of State'
            },
            author: {
              id: 'a928',
              firstName: 'Jane',
              lastName: 'Doe'
            },
            projectTitle: 'Test Title 1',
            status: 'PUBLISHED',
            visibility: 'INTERNAL',
            thumbnails: {
              id: 't34',
              url: 'https://thumbnailurl.com',
              alt: 'some alt text',
            },
            categories: [
              {
                id: '38s',
                translations: [
                  {
                    id: '832',
                    name: 'about america',
                    language: {
                      id: 'en23',
                      locale: 'en-us'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'ud98',
            createdAt: '2019-05-12T18:33:03.368Z',
            updatedAt: '2019-05-12T18:33:03.368Z',
            team: {
              id: 't888',
              name: 'IIP Video Production',
              organization: 'Department of State'
            },
            author: {
              id: 'a287',
              firstName: 'Joe',
              lastName: 'Schmoe'
            },
            projectTitle: 'Test Title 2',
            status: 'PUBLISHED',
            visibility: 'INTERNAL',
            thumbnails: {
              id: 't34',
              url: 'https://thumbnailurl.com',
              alt: 'some alt text',
            },
            categories: [
              {
                id: '38s',
                translations: [
                  {
                    id: '832',
                    name: 'about america',
                    language: {
                      id: 'en23',
                      locale: 'en-us'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'ud64',
            createdAt: '2019-05-12T18:33:03.368Z',
            updatedAt: '2019-05-12T18:33:03.368Z',
            team: {
              id: 't888',
              name: 'IIP Video Production',
              organization: 'Department of State'
            },
            author: {
              id: 'a287',
              firstName: 'Joe',
              lastName: 'Schmoe'
            },
            projectTitle: 'Test Title 2',
            status: 'PUBLISHED',
            visibility: 'INTERNAL',
            thumbnails: {
              id: 't34',
              url: 'https://thumbnailurl.com',
              alt: 'some alt text',
            },
            categories: [
              {
                id: '38s',
                translations: [
                  {
                    id: '832',
                    name: 'about america',
                    language: {
                      id: 'en23',
                      locale: 'en-us'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'ud23',
            createdAt: '2019-05-12T18:33:03.368Z',
            updatedAt: '2019-05-12T18:33:03.368Z',
            team: {
              id: 't888',
              name: 'IIP Video Production',
              organization: 'Department of State'
            },
            author: {
              id: 'a287',
              firstName: 'Joe',
              lastName: 'Schmoe'
            },
            projectTitle: 'Test Title 2',
            status: 'DRAFT',
            visibility: 'INTERNAL',
            thumbnails: {
              id: 't34',
              url: 'https://thumbnailurl.com',
              alt: 'some alt text',
            },
            categories: [
              {
                id: '38s',
                translations: [
                  {
                    id: '832',
                    name: 'about america',
                    language: {
                      id: 'en23',
                      locale: 'en-us'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'ud74',
            createdAt: '2019-05-12T18:33:03.368Z',
            updatedAt: '2019-05-12T18:33:03.368Z',
            team: {
              id: 't888',
              name: 'IIP Video Production',
              organization: 'Department of State'
            },
            author: {
              id: 'a287',
              firstName: 'Joe',
              lastName: 'Schmoe'
            },
            projectTitle: 'Test Title 2',
            status: 'DRAFT',
            visibility: 'INTERNAL',
            thumbnails: {
              id: 't34',
              url: 'https://thumbnailurl.com',
              alt: 'some alt text',
            },
            categories: [
              {
                id: '38s',
                translations: [
                  {
                    id: '832',
                    name: 'about america',
                    language: {
                      id: 'en23',
                      locale: 'en-us'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }
];

const Component = (
  <MockedProvider mocks={ mocks } addTypename={ false }>
    <TableActionsMenu { ...props } />
  </MockedProvider>
);

const findProjectById = ( array, projectId ) => (
  array.find( n => n.id === projectId )
);

describe( '<TableActionsMenu />', () => {
  it( 'renders initial loading state without crashing', () => {
    const wrapper = mount( Component );
    const menu = wrapper.find( TableActionsMenu );

    expect( menu.exists() ).toEqual( true );
    expect( menu.contains( 'Loading....' ) ).toEqual( true );
  } );

  it( 'renders error message if an error is returned', async () => {
    const errorMocks = [
      {
        request: {
          query: TEAM_VIDEO_PROJECTS_QUERY,
          variables: { ...props.variables }
        },
        result: {
          errors: [{ message: 'There was an error.' }]
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ errorMocks } addTypename={ false }>
        <TableActionsMenu { ...props } />
      </MockedProvider>
    );

    // wait for the data and !loading
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const errorComponent = menu.find( ApolloError );

    expect( errorComponent.exists() ).toEqual( true );
    expect( errorComponent.contains( 'There was an error.' ) )
      .toEqual( true );
  } );

  it( 'renders null if videoProjects is falsy', async () => {
    const nullMocks = [
      {
        request: {
          query: TEAM_VIDEO_PROJECTS_QUERY,
          variables: { ...props.variables }
        },
        result: {
          data: { videoProjects: null }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ nullMocks } addTypename={ false }>
        <TableActionsMenu { ...props } />
      </MockedProvider>
    );

    await wait( 0 );
    wrapper.update();

    const menuWrapper = wrapper.find( '.actionsMenu_wrapper' );

    /**
     *  the Query (i.e., `childAt( 0 )` ) returns
     *  `null` but will continue to render the
     *  remainder of the menu (e.g., Modal, Popup, etc.)
     */
    expect( menuWrapper.childAt( 0 ).html() ).toEqual( null );
  } );

  it( 'renders a Checkbox when TEAM_VIDEO_PROJECTS_QUERY is resolved', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const checkbox = wrapper.find( Checkbox );
    const projectsCount = mocks[4].result.data.videoProjects.length;

    expect( checkbox.exists() ).toEqual( true );
    expect( checkbox.prop( 'disabled' ) ).toEqual( projectsCount === 0 );
    expect( checkbox.prop( 'checked' ) ).toEqual( projectsCount === props.selectedItems.size );
  } );

  it( 'renders a disabled Checkbox if no videoProjects are returned', async () => {
    const emptyMocks = [
      {
        request: {
          query: TEAM_VIDEO_PROJECTS_QUERY,
          variables: { ...props.variables }
        },
        result: {
          data: { videoProjects: [] }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ emptyMocks } addTypename={ false }>
        <TableActionsMenu { ...props } />
      </MockedProvider>
    );

    await wait( 0 );
    wrapper.update();

    const checkbox = wrapper.find( Checkbox );
    const projectsCount = emptyMocks[0].result.data.videoProjects.length;

    expect( checkbox.exists() ).toEqual( true );
    expect( checkbox.prop( 'disabled' ) ).toEqual( projectsCount === 0 );
  } );

  it( 'renders a checked Checkbox if all projects are selected', async () => {
    const { videoProjects } = mocks[4].result.data;

    const allCheckedMocks = [
      {
        request: {
          query: TEAM_VIDEO_PROJECTS_QUERY,
          variables: { ...props.variables }
        },
        result: {
          data: {
            videoProjects: videoProjects
              .filter( project => project.id === 'ud78' || project.id === 'ud98' )
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ allCheckedMocks } addTypename={ false }>
        <TableActionsMenu { ...props } />
      </MockedProvider>
    );

    await wait( 0 );
    wrapper.update();

    const checkbox = wrapper.find( Checkbox );
    const projectsCount = allCheckedMocks[0].result.data.videoProjects.length;

    expect( checkbox.prop( 'checked' ) ).toEqual( projectsCount === props.selectedItems.size );
  } );

  it( 'renders an indeterminate Checkbox if at least one but not all projects are selected', async () => {
    const wrapper = mount( Component );

    await wait( 0 );
    wrapper.update();

    const checkbox = wrapper.find( Checkbox );
    const projectsCount = mocks[4].result.data.videoProjects.length;

    expect( checkbox.prop( 'indeterminate' ) )
      .toEqual( projectsCount > props.selectedItems.size );
  } );

  it( 'Checkbox change calls toggleAllItemsSelection', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const checkbox = wrapper.find( Checkbox );

    checkbox.simulate( 'change' );

    expect( props.toggleAllItemsSelection ).toHaveBeenCalled();
  } );

  it( 'componentDidMount sets _isMounted', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();

    inst.componentDidMount();

    expect( inst._isMounted ).toEqual( true );
  } );

  it( 'componentWillUnmount sets _isMounted to false', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();

    inst.componentWillUnmount();

    expect( inst._isMounted ).toEqual( false );
  } );

  it( 'delayUnmount calls a function after a delay', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const fn = jest.fn();
    const timer = inst.confirmationMsgTimer;
    const delay = inst.CONFIRMATION_MSG_DELAY;

    inst.delayUnmount( fn, timer, delay );
    await wait( delay );
    expect( fn ).toHaveBeenCalled();
  } );

  it( 'calling showConfirmationMsg/hideConfirmationMsg sets displayConfirmationMsg to true/false in state', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();

    // initial state
    expect( inst.state.displayConfirmationMsg ).toEqual( false );

    inst.showConfirmationMsg();
    if ( inst._isMounted ) {
      expect( inst.state.displayConfirmationMsg ).toEqual( true );
    }

    inst.hideConfirmationMsg();
    expect( inst.state.displayConfirmationMsg ).toEqual( false );
    expect( inst.confirmationMsgTimer ).toEqual( null );
  } );

  it( 'calling displayConfirmDelete/handleDeleteCancel sets deleteConfirmOpen to true/false in state', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();

    // initial state
    expect( inst.state.deleteConfirmOpen ).toEqual( false );

    inst.displayConfirmDelete();
    expect( inst.state.deleteConfirmOpen ).toEqual( true );

    inst.handleDeleteCancel();
    expect( inst.state.deleteConfirmOpen ).toEqual( false );
  } );

  it( 'closing confirmation modal calls hideConfirmationMsg', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = () => wrapper.find( TableActionsMenu );
    const inst = () => menu().instance();
    const confirmModal = () => menu().find( 'Modal.confirmation' );
    const spy = jest.spyOn( inst(), 'hideConfirmationMsg' );

    // must open the modal before closing it
    inst().showConfirmationMsg();
    wrapper.update();
    expect( inst().state.displayConfirmationMsg ).toEqual( true );
    expect( confirmModal().prop( 'open' ) ).toEqual( true );

    // close the modal
    confirmModal().prop( 'onClose' )();
    expect( spy ).toHaveBeenCalled();
  } );

  it( 'handleDeleteConfirm calls deleteProjects mutate function', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const deleteProjects = jest.fn();
    const args = {
      variables: {
        where: { id_in: [...props.selectedItems.keys()] }
      },
      refetchQueries: [{
        query: TEAM_VIDEO_PROJECTS_QUERY,
        variables: { ...props.variables }
      },
      {
        query: TEAM_VIDEO_PROJECTS_COUNT_QUERY,
        variables: {
          team: props.variables.team,
          searchTerm: props.variables.searchTerm
        }
      }]
    };

    inst.handleDeleteConfirm( deleteProjects );

    expect( deleteProjects ).toHaveBeenCalledWith( args );
  } );

  it( 'handleUnpublish calls unpublish mutate function', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const unpublish = jest.fn();
    const args = {
      variables: {
        data: { status: 'DRAFT', visibility: 'INTERNAL' },
        where: {
          AND: [
            { id_in: [...props.selectedItems.keys()] },
            { status: 'PUBLISHED' }
          ]
        }
      }
    };

    inst.handleUnpublish( unpublish );

    expect( unpublish ).toHaveBeenCalledWith( args );
  } );

  it( 'handleStatus sets status field', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const items = [...props.selectedItems.keys()];
    const projects = [
      { id: 'ud78', status: 'PUBLISHED' },
      { id: 'ud98', status: 'PUBLISHED' }
    ];

    inst.handleStatus( items, projects );

    projects.forEach( project => {
      expect( project.status ).toEqual( 'DRAFT' );
    } );
  } );

  it( 'transformSelectedItemsMap returns a transformed array of selected item objects', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const transformed = inst.transformSelectedItemsMap();

    expect( transformed ).toEqual(
      [{ id: 'ud78', value: true }, { id: 'ud98', value: true }]
    );
  } );

  it( 'getSelectedProjects returns an array of selected project ids', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const selectedProjects = inst.getSelectedProjects();

    expect( selectedProjects ).toEqual( ['ud78', 'ud98'] );
  } );

  it( 'hasSelectedAllDrafts returns false if all selected projects have PUBLISHED status', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const separator = menu.find( '.separator' );
    const unpublishProjects = menu.find( 'UnpublishProjects' );
    const inst = menu.instance();
    const hasSelectedAllDrafts = inst.hasSelectedAllDrafts();
    const selectedProjects = ['ud78', 'ud98'];
    const { videoProjects } = mocks[4].result.data;

    selectedProjects.forEach( project => {
      expect( findProjectById( videoProjects, project ).status )
        .toEqual( 'PUBLISHED' );
    } );
    expect( hasSelectedAllDrafts ).toEqual( false );
    expect( separator.exists() ).toEqual( !hasSelectedAllDrafts );
    expect( unpublishProjects.exists() ).toEqual( !hasSelectedAllDrafts );
  } );

  it( 'hasSelectedAllDrafts returns true if all selected projects have DRAFT status', async () => {
    const newProps = {
      ...props,
      ...{
        selectedItems: new Map( [['ud23', true], ['ud74', true]] )
      }
    };

    const wrapper = mount(
      <MockedProvider mocks={ mocks } addTypename={ false }>
        <TableActionsMenu { ...newProps } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const separator = menu.find( '.separator' );
    const unpublishProjects = menu.find( 'UnpublishProjects' );
    const inst = menu.instance();
    const hasSelectedAllDrafts = inst.hasSelectedAllDrafts();
    const selectedProjects = inst.state.draftProjects;
    const { videoProjects } = mocks[4].result.data;

    selectedProjects.forEach( project => {
      expect( findProjectById( videoProjects, project ).status )
        .toEqual( 'DRAFT' );
    } );
    expect( hasSelectedAllDrafts ).toEqual( true );
    expect( separator.exists() ).toEqual( !hasSelectedAllDrafts );
    expect( unpublishProjects.exists() ).toEqual( !hasSelectedAllDrafts );
  } );

  it( 'hasSelectedAllDrafts returns false if one selected project has DRAFT status', async () => {
    const newProps = {
      ...props,
      ...{
        selectedItems: new Map( [['ud78', true], ['ud74', true]] )
      }
    };

    const wrapper = mount(
      <MockedProvider mocks={ mocks } addTypename={ false }>
        <TableActionsMenu { ...newProps } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const separator = menu.find( '.separator' );
    const unpublishProjects = menu.find( 'UnpublishProjects' );
    const inst = menu.instance();
    const hasSelectedAllDrafts = inst.hasSelectedAllDrafts();
    const { videoProjects } = mocks[4].result.data;

    expect( findProjectById( videoProjects, 'ud78' ).status )
      .toEqual( 'PUBLISHED' );
    expect( findProjectById( videoProjects, 'ud74' ).status )
      .toEqual( 'DRAFT' );
    expect( hasSelectedAllDrafts ).toEqual( false );
    expect( separator.exists() ).toEqual( !hasSelectedAllDrafts );
    expect( unpublishProjects.exists() ).toEqual( !hasSelectedAllDrafts );
  } );

  it( 'getDraftProjects returns an array of draft project ids', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const { videoProjects } = mocks[4].result.data;
    const draftProjects = inst.getDraftProjects( videoProjects );

    expect( draftProjects ).toEqual( inst.state.draftProjects );
    draftProjects.forEach( project => {
      expect( findProjectById( videoProjects, project ).status )
        .toEqual( 'DRAFT' );
    } );
  } );

  it( 'getCachedQuery calls cache.readQuery with the correct arguments', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const cache = { readQuery: jest.fn() };
    const query = TEAM_VIDEO_PROJECTS_QUERY;

    inst.getCachedQuery( cache, query, props.variables );
    expect( cache.readQuery ).toHaveBeenCalledWith( {
      query,
      variables: { ...props.variables }
    } );
  } );

  it( 'handleDrafts sets draftProjects in state', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const menu = wrapper.find( TableActionsMenu );
    const inst = menu.instance();
    const { videoProjects } = mocks[4].result.data;

    /**
     * This test also provides evidence that `handleDrafts`
     * is called on completion of the `Query`. See comment
     * in the component about React Apollo bug and
     * `onCompleted`.
     */
    expect( inst.state.draftProjects ).toEqual( ['ud23', 'ud74'] );
    inst.state.draftProjects.forEach( project => {
      expect( findProjectById( videoProjects, project ).status )
        .toEqual( 'DRAFT' );
    } );
  } );
} );
