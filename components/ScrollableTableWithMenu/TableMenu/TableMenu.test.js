import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import TableMenu from './TableMenu';

const props = {
  columnMenu: [
    { name: 'author', label: 'AUTHOR' },
    { name: 'categories', label: 'CATEGORIES' },
    { name: 'createdAt', label: 'DATE' }
  ],
  tableMenuOnChange: jest.fn()
};

const Component = <TableMenu { ...props } />;

describe( '<TableMenu />', () => {
  it( 'renders without crashing', () => {
    const wrapper = shallow( Component );

    expect( wrapper.exists() ).toEqual( true );
    expect( toJSON( wrapper ) ).toMatchSnapshot();
  } );

  it( 'componentDidMount calls menuHeadersOnMobile and ', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'menuHeadersOnMobile' );

    inst.componentDidMount();
    expect( spy ).toHaveBeenCalled();
  } );

  it( 'componentDidMount attaches event listeners', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const clickSpy = jest.spyOn( inst, 'toggleTableMenu' )
      .mockImplementation( () => {} );
    const keydownSpy = jest.spyOn( inst, 'handleKbdAccess' )
      .mockImplementation( () => {} );
    const resizeSpy = jest.spyOn( inst, 'menuHeadersOnResize' )
      .mockImplementation( () => {} );

    const map = {};
    window.addEventListener = jest.fn( ( event, cb ) => {
      map[event] = cb;
    } );

    inst.componentDidMount();

    map.click();
    expect( clickSpy ).toHaveBeenCalled();

    map.keydown();
    expect( keydownSpy ).toHaveBeenCalled();

    map.resize();
    expect( resizeSpy ).toHaveBeenCalled();
  } );

  it( 'componentWillUnmount removes event listeners', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const clickSpy = jest.spyOn( inst, 'toggleTableMenu' )
      .mockImplementation( () => {} );
    const keydownSpy = jest.spyOn( inst, 'handleKbdAccess' )
      .mockImplementation( () => {} );
    const resizeSpy = jest.spyOn( inst, 'menuHeadersOnResize' )
      .mockImplementation( () => {} );

    const map = {};
    window.removeEventListener = jest.fn( ( event, cb ) => {
      map[event] = cb;
    } );

    Promise.resolve()
      .then( () => {
        inst.componentWillUnmount();
        expect( clickSpy ).toHaveBeenCalled();
        expect( keydownSpy ).toHaveBeenCalled();
        expect( resizeSpy ).toHaveBeenCalled();
      } )
      .catch( () => {} );
  } );

  it( 'getColumns returns an array of columnMenu labels', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const columns = inst.getColumns();

    columns.forEach( ( column, i ) => {
      expect( column ).toEqual( props.columnMenu[i].label );
    } );
  } );

  it( 'componentDidUpdate calls getColumns and handleCheckboxFocus', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const columnsSpy = jest.spyOn( inst, 'getColumns' )
      .mockImplementation( () => {} );
    const checkboxSpy = jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    // check initial state
    expect( inst.state.displayTableMenu ).toEqual( false );

    wrapper.setState( { displayTableMenu: true } );
    expect( inst.state.displayTableMenu ).toEqual( true );
    expect( columnsSpy ).toHaveBeenCalled();
    expect( checkboxSpy ).toHaveBeenCalled();
  } );

  it( 'handleCloseMenu sets displayTableMenu state to false', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    jest.spyOn( inst, 'componentDidUpdate' )
      .mockImplementation( () => {} );

    // set to true first
    wrapper.setState( { displayTableMenu: true } );

    inst.handleCloseMenu();
    expect( inst.state.displayTableMenu ).toEqual( false );
  } );

  it( 'setRef assigns a ref with a name', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );
    const node = <div>test node</div>;
    const refName = 'AUTHOR';

    wrapper.setState( { displayTableMenu: true } );
    inst.setRef( node, refName );

    expect( inst[refName].type ).toEqual( 'div' );
    expect( inst[refName].props.children ).toEqual( 'test node' );
  } );

  it( 'pressing Escape/Tab calls handleKbdAccess and handleCloseMenu', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'handleCloseMenu' );
    jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    const e = {
      key: '',
      target: { id: '0', type: 'checkbox' },
      preventDefault: jest.fn()
    };

    const keys = ['Escape', 'Tab'];

    // first, display the dropdown menu
    wrapper.setState( { displayTableMenu: true } );

    keys.forEach( key => {
      e.key = key;
      inst.handleKbdAccess( e );
      expect( spy ).toHaveBeenCalled();
      expect( e.preventDefault ).not.toHaveBeenCalled();
    } );
  } );

  it( 'pressing ArrowDown calls handleKbdAccess, handleCheckboxFocus, and preventDefault', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    const e = {
      key: 'ArrowDown',
      target: { id: '', type: 'checkbox' },
      preventDefault: jest.fn()
    };

    const columns = inst.getColumns();
    const current = () => columns.indexOf( e.target.id );

    // first, display the dropdown menu
    wrapper.setState( { displayTableMenu: true } );

    columns.forEach( column => {
      e.target.id = column;
      inst.handleKbdAccess( e );
      expect( e.preventDefault ).toHaveBeenCalled();
      if ( current() === columns.length - 1 ) {
        expect( spy ).toHaveBeenCalledWith( columns, 0 );
      } else {
        expect( spy ).toHaveBeenCalledWith( columns, current() + 1 );
      }
    } );
  } );

  it( 'pressing ArrowUp calls handleKbdAccess, handleCheckboxFocus, and preventDefault', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    const e = {
      key: 'ArrowUp',
      target: { id: '', type: 'checkbox' },
      preventDefault: jest.fn()
    };

    const columns = inst.getColumns();
    const current = () => columns.indexOf( e.target.id );

    // first, display the dropdown menu
    wrapper.setState( { displayTableMenu: true } );

    columns.forEach( column => {
      e.target.id = column;
      inst.handleKbdAccess( e );
      expect( e.preventDefault ).toHaveBeenCalled();
      if ( current() === 0 ) {
        expect( spy ).toHaveBeenCalledWith( columns, columns.length - 1 );
      } else {
        expect( spy ).toHaveBeenCalledWith( columns, current() - 1 );
      }
    } );
  } );

  it( 'pressing Home calls handleKbdAccess, handleCheckboxFocus, and preventDefault', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    const e = {
      key: 'Home',
      target: { id: '', type: 'checkbox' },
      preventDefault: jest.fn()
    };

    const columns = inst.getColumns();

    // first, display the dropdown menu
    wrapper.setState( { displayTableMenu: true } );

    columns.forEach( column => {
      e.target.id = column;
      inst.handleKbdAccess( e );
      expect( spy ).toHaveBeenCalledWith( columns, 0 );
      expect( e.preventDefault ).toHaveBeenCalled();
    } );
  } );

  it( 'pressing End calls handleKbdAccess, handleCheckboxFocus, and preventDefault', () => {
    const wrapper = shallow( Component );
    const inst = wrapper.instance();
    const spy = jest.spyOn( inst, 'handleCheckboxFocus' )
      .mockImplementation( () => {} );

    const e = {
      key: 'End',
      target: { id: '', type: 'checkbox' },
      preventDefault: jest.fn()
    };

    const columns = inst.getColumns();

    // first, display the dropdown menu
    wrapper.setState( { displayTableMenu: true } );

    columns.forEach( column => {
      e.target.id = column;
      inst.handleKbdAccess( e );
      expect( spy ).toHaveBeenCalledWith( columns, columns.length - 1 );
      expect( e.preventDefault ).toHaveBeenCalled();
    } );
  } );
} );
