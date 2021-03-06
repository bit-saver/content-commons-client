/**
 *
 * SupportItem
 *
 */
import React, {
  Fragment, useState, useEffect, useRef, useContext
} from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Loader, Popup } from 'semantic-ui-react';
import debounce from 'lodash/debounce';
import Focusable from 'components/Focusable/Focusable';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';
import { LANGUAGES_QUERY } from 'components/admin/dropdowns/LanguageDropdown';
import { UploadContext } from '../VideoEdit/VideoEdit';

import './SupportItem.scss';


/* eslint-disable react/prefer-stateless-function */
const SupportItem = props => {
  const STR_INDEX_PROPORTION = 0.04;
  const ITEM_NAME_PROPORTION = 0.625;
  const ITEM_LANG_PROPORTION = 0.3;
  const DELAY_INTERVAL = 1000;

  const listEl = useRef( null );
  const filenameEl = useRef( null );
  const languageEl = useRef( null );
  const mounted = useRef( true );

  const uploadInProgress = useContext( UploadContext );

  const [widths, setWidths] = useState( {
    listItem: 0,
    itemName: 0,
    itemLang: 0
  } );

  const { item } = props;
  const { listItem, itemName, itemLang } = widths;

  const updateWidths = () => {
    if ( mounted.current ) {
      setWidths( {
        listItem: listEl.current.offsetWidth,
        itemName: filenameEl.current.offsetWidth,
        itemLang: languageEl.current.offsetWidth
      } );
    }
  };

  const debounceResize = debounce( updateWidths, DELAY_INTERVAL );

  useEffect( () => {
    window.addEventListener( 'resize', debounceResize );
    updateWidths();

    return () => {
      window.removeEventListener( 'resize', debounceResize );
      mounted.current = false;
    };
  }, [] );


  /**
   * Truncates long strings with ellipsis
   * @param {string} str the string
   * @param {number} start index for first cutoff point
   * @param {number} end index for ending cutoff point
   * @return truncated string
   */
  const getShortFileName = ( str, index ) => (
    <Fragment>
      { `${str.substr( 0, index )}` }&hellip;{ `${str.substr( -index )}` }
    </Fragment>
  );

  /**
   * Determines an integer proportional
   * to a reference number
   * @param {number} reference
   * @return {number}
   */
  const getProportionalNumber = ( reference, proportion ) => (
    Math.floor( reference * proportion )
  );

  const isLongName = ( itemWidth, reference, proportion ) => (
    itemWidth >= getProportionalNumber( reference, proportion )
  );


  const normalizeLanguage = lang => {
    if ( typeof ( lang ) === 'string' ) { // will be object if coming from graphql
      return props.data.languages.filter( l => l.id === lang )[0];
    }
    return lang;
  };

  const normalizeItem = ( prop, defaultValue ) => {
    const fileProp = item[prop];

    if ( fileProp ) {
      return fileProp;
    } if ( item.input ) {
      return item.input[prop.replace( 'file', '' )];
    }
    return defaultValue;
  };

  const filename = normalizeItem( 'filename', '' );
  const filesize = normalizeItem( 'filesize', 0 );
  const language = normalizeLanguage( item.language );
  const charIndex = getProportionalNumber( listItem, STR_INDEX_PROPORTION );
  const shortFileName = getShortFileName( filename, charIndex );
  const isLongFileName = isLongName( itemName, listItem, ITEM_NAME_PROPORTION );
  const isLongLangName = isLongName( itemLang, listItem, ITEM_LANG_PROPORTION );
  const isUploading = uploadInProgress && ( item.loaded < filesize );

  const popupStyle = {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    msWordBreak: 'break-all',
    wordBreak: 'break-word'
  };

  return (
    <li
      key={ `${item.id}-${language.id}` }
      className={ `support-item ${( item.loaded < filesize ) ? 'new' : ''}` }
      ref={ listEl }
    >
      <span className="item-name">
        { isLongFileName && <VisuallyHidden>{ filename }</VisuallyHidden> }
        <span
          className={
              `item-name-wrap${isLongFileName ? ' hasEllipsis' : ''}`
            }
          aria-hidden={ isLongFileName }
          ref={ filenameEl }
        >
          { isLongFileName
            ? (
              <Popup
                content={ filename }
                size="mini"
                inverted
                on={ [
                  'hover',
                  'click',
                  'focus'
                ] }
                trigger={ (
                  <span>
                    <Focusable>{ shortFileName }</Focusable>
                  </span>
                  ) }
                style={ popupStyle }
              />
            ) : filename }
        </span>

        <Loader active={ isUploading } inline size="mini" style={ { marginLeft: '.5rem' } } />

      </span>

      <span className="item-lang">
        <b
          className={
              `item-lang-wrap${isLongLangName ? ' hasEllipsis' : ''}`
            }
          ref={ languageEl }
        >
          { isLongLangName
            ? (
              <Popup
                trigger={ (
                  <span>
                    <Focusable>{ language.displayName }</Focusable>
                  </span>
                  ) }
                content={ language.displayName }
                on={ [
                  'hover',
                  'click',
                  'focus'
                ] }
                inverted
                size="mini"
                style={ popupStyle }
              />
            ) : language.displayName }
        </b>
      </span>
    </li>
  );
};


SupportItem.propTypes = {
  item: PropTypes.object,
  data: PropTypes.object
};

export default compose(
  graphql( LANGUAGES_QUERY )
)( SupportItem );
