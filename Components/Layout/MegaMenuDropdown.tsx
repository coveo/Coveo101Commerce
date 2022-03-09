import React from 'react';
import { CategoryFacetState, CategoryFacet, buildCategoryFacet, Unsubscribe, loadSearchAnalyticsActions, loadSearchActions } from '@coveo/headless';
import { headlessEngine_MegaMenu } from '../../helpers/Engine';
import { List, ListItem, IconButton, Link, Popper, Drawer } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

import { routerPush } from '../../helpers/Context';
import { NextRouter, withRouter } from 'next/router';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

interface MegaMenuDropdownProps {
  closeMegaMenu: () => void;
  isMenuActive: boolean;
  router: NextRouter;
}

export interface IMenuStructureCategory {
  displayValue: string;
  urlValue: string;
  value: string;
  subCategories: IMenuStructure;
  subCategoriesCount: number;
}

export interface IMenuStructure {
  [key: string]: IMenuStructureCategory;
}

export interface IMegaMenuDropdownState {
  data: CategoryFacetState;
  activeMenu: string;
  initialSearchDone: boolean;
  anchorElement: HTMLElement;
  isMenuOpen: boolean;
  isMobileSize: boolean;
  //for mobile responsiveness - drawer
  showSecondPanel: boolean;
}

export class MegaMenuDropdown extends React.Component<MegaMenuDropdownProps, IMegaMenuDropdownState> {
  private categoryFacet: CategoryFacet;
  state: IMegaMenuDropdownState;
  private numberOfValues = 10000;
  private levelOfDepth = 3;
  private unsubscribe: Unsubscribe = () => { };
  protected menuStructure: IMenuStructure = {};

  constructor(props) {
    super(props);

    this.categoryFacet = buildCategoryFacet(headlessEngine_MegaMenu, {
      options: {
        facetId: 'ec_category',
        field: 'ec_category',
        delimitingCharacter: ';',
        numberOfValues: this.numberOfValues,
      },
    });

    this.state = {
      data: this.categoryFacet.state,
      activeMenu: '',
      initialSearchDone: false,
      anchorElement: null,
      isMenuOpen: false,
      isMobileSize: false,
      showSecondPanel: false,
    };
  }

  componentDidMount() {
    this.setWindowSize();
    window.addEventListener('resize', this.setWindowSize);
    this.unsubscribe = this.categoryFacet.subscribe(() => this.updateState());
  }

  componentDidUpdate() {
    if ((this.state.isMenuOpen || !this.state.isMobileSize) && !this.state.initialSearchDone) {
      this.executeSearchForMenu();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    window.removeEventListener('resize', this.setWindowSize);
  }

  setWindowSize = () => {
    const isMobileSize = window.innerWidth < 500;
    this.setState({ isMobileSize });
  };

  updateState() {
    if (Object.keys(this.menuStructure).length === 0) {
      this.makeValues();
    }

    this.setState(() => {
      // Use first element of menu to show something by default
      let firstMenuElement = '';

      if (this.menuStructure) {
        firstMenuElement = Object.keys(this.menuStructure)[0];
        firstMenuElement = this.menuStructure[firstMenuElement]?.displayValue;
      }

      return {
        data: this.categoryFacet.state,
        activeMenu: this.state.activeMenu || firstMenuElement,
      };
    });
  }

  private executeSearchForMenu() {
    if (this.state.initialSearchDone) {
      return;
    }
    this.setState({ initialSearchDone: true });

    // Execute initial search to populate facet values
    const analyticActions = loadSearchAnalyticsActions(headlessEngine_MegaMenu);
    const searchActions = loadSearchActions(headlessEngine_MegaMenu);

    headlessEngine_MegaMenu.dispatch(searchActions.executeSearch(analyticActions.logInterfaceLoad()));
  }

  //  Get all values based on current level of Depth
  private get allValuesFromDepth() {
    const depthValues = this.categoryFacet.state.values.filter((fieldValue) => {
      return fieldValue.value.split('|').length <= this.levelOfDepth;
    });

    return depthValues;
  }

  private populateCategoryStructure(currentStructureLevel: IMenuStructure | {}, categoryArr: string[], index: number) {
    if (!categoryArr[index]) {
      return;
    }

    if (!currentStructureLevel[categoryArr[index]]) {
      const urlValue = categoryArr
        .map((c) => c.replace(/[^\w]+/g, '-'))
        .join('/')
        .toLocaleLowerCase();

      currentStructureLevel[categoryArr[index]] = {
        displayValue: categoryArr[index],
        value: categoryArr.join('|'),
        urlValue,
        subCategories: {},
        subCategoriesCount: 0,
      } as IMenuStructureCategory;
    }

    this.populateCategoryStructure(currentStructureLevel[categoryArr[index]].subCategories, categoryArr, index + 1);
    currentStructureLevel[categoryArr[index]].subCategoriesCount = Object.keys(currentStructureLevel[categoryArr[index]].subCategories).length;
  }

  makeValues() {
    this.allValuesFromDepth.forEach((facetValue) => {
      const categoryArr = facetValue.value.split('|');
      this.populateCategoryStructure(this.menuStructure, categoryArr, 0);
    });

    if (this.menuStructure && Object.keys(this.menuStructure).length) {
      this.menuStructure['Kids'] = {
        displayValue: 'Kids',
        urlValue: 'kids',
        value: 'Kids',
        subCategories: {
          Pyjamas: {
            displayValue: 'Pyjamas',
            urlValue: 'kids/pyjamas',
            value: 'Kids|Pyjamas',
            subCategories: {},
            subCategoriesCount: 0,
          }
        },
        subCategoriesCount: 1,
      };
      this.menuStructure['On Sale'] = {
        displayValue: 'On Sale',
        urlValue: 'on-sale',
        value: 'On Sale',
        subCategories: {},
        subCategoriesCount: 0,
      };
    }
  }

  private goToCategory(categories: string[]) {
    if (!categories.join('')) {
      // empty categories
      routerPush(this.props.router, { pathname: '/' });
    }
    else {
      routerPush(this.props.router, { pathname: '/plp/[...category]', query: { category: categories } });
    }
  }

  protected listElement_tl(menuElement, listElementClass = '', isMainListElement = false) {
    const isActive = this.state.activeMenu === menuElement.displayValue ? ' active-menu-el' : '';

    return (
      <Link
        key={'menuItemText-' + menuElement.urlValue}
        className={'megamenu__item-title ' + listElementClass + isActive}
        onClick={() => {
          if (!this.state.isMobileSize && publicRuntimeConfig.extraCSS) {
            this.closeMegaMenu();
            this.goToCategory(menuElement.urlValue.split('/'));
          } else {
            if (isMainListElement) {
              this.setState({ activeMenu: menuElement.displayValue });
            } else {
              this.closeMegaMenu();
              this.goToCategory(menuElement.urlValue.split('/'));
            }
            this.setState({ showSecondPanel: true });
          }
        }}
        onMouseEnter={(e) => this.onMouseEnter(e, menuElement, isMainListElement)}>
        <span data-item-value={menuElement.urlValue} data-item-category={menuElement.value}>
          {menuElement.displayValue}
        </span>

        {isMainListElement && (
          <IconButton edge='end' aria-label='see_more' className='megamenu__arrow--main-item'>
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Link>
    );
  }

  buildMainPanel() {
    // check if the menuStructure is ready before adding Favorites
    if (this.menuStructure && Object.keys(this.menuStructure).length) {
      // try-catch to trap errors with JSON.parse()
      try {
        // get the categories set by Qubit placement in the local storage.
        const categoryCache = JSON.parse(window.localStorage.getItem('coveo-qb-category-views'));
        const sortedFavorites = Object.values(categoryCache).sort((a: any, b: any) => b.count - a.count);
        const FavoritesSubCategories: IMenuStructure = {};

        sortedFavorites.slice(0, 5).forEach((fav: any) => {
          FavoritesSubCategories[fav.categoryDisplay] = {
            displayValue: fav.categoryDisplay,
            urlValue: fav.link.replace(/^\/plp\//, ''),
            value: fav.categoryDisplay,
            subCategories: {},
            subCategoriesCount: 0,
          };
        });

        this.menuStructure['Favorites'] = {
          displayValue: 'Favorites',
          urlValue: '',
          value: 'Favorites',
          subCategories: FavoritesSubCategories,
          subCategoriesCount: Object.keys(FavoritesSubCategories).length,
        };

      }
      catch (e) {
        /* no-op */
      }
    }

    const list = Object.values(this.menuStructure).map((menuItem: IMenuStructureCategory) => {
      return (
        <ListItem className={'megamenu__list-item'} key={'menuItem-' + menuItem.urlValue}>
          {this.listElement_tl(menuItem, '', true)}
        </ListItem>
      );
    });

    return <List className={'megamenu__root-list'}>
      {list}
      <div id='header-btn--favorites'></div>
    </List>;
  }

  private buildSubList(menuLevel) {
    if (!menuLevel.subCategories) {
      return null;
    }
    // Make the number of subcategories = 5
    const menuLevelSliced = Object.values(menuLevel.subCategories).slice(0, 5);

    const list = menuLevelSliced.map((menuItem: IMenuStructureCategory, index: number) => {
      return (
        <ListItem className={'megamenu__sub-sublist-item'} key={menuItem.urlValue + '-' + index}>
          {this.listElement_tl(menuItem)}
        </ListItem>
      );
    });

    return <List className={'megamenu__sub-sub-list'}>{list}</List>;
  }

  buildSubcategoryPanel() {
    if (!this.state.activeMenu) {
      return null;
    }

    const subCategoriesObj = this.menuStructure[this.state.activeMenu]?.subCategories;
    if (!subCategoriesObj) {
      return null;
    }
    const subcategories = Object.values(subCategoriesObj).slice(0, 8);

    const list = subcategories.map((menuItem: IMenuStructureCategory) => {
      return (
        <ListItem className={'megamenu__sublist-item'} key={'menuItem-' + menuItem.urlValue}>
          {this.listElement_tl(menuItem, 'megamenu__sublist-title')}
          {this.buildSubList(subCategoriesObj[menuItem.displayValue])}
        </ListItem>
      );
    });

    return (
      <div className={'megamenu__sublist-container'}>
        <Link
          onClick={() => {
            this.closeMegaMenu();
            this.goToCategory(this.menuStructure[this.state.activeMenu].urlValue.split('/'));
          }}
          className='megamenu__sublist-header'>
          <h4 className='megamenu__sublist-title'>{this.state.activeMenu}</h4>
          {this.state.isMobileSize ? (
            <span className='megamenu__sublist-subtitle'>
              <IconButton
                className='small-arrow megamenu__sublist-btn'
                color='primary'
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ showSecondPanel: false });
                }}>
                <ArrowBackIosIcon />
                <span style={{ fontSize: '12px' }}>Go Back</span>
              </IconButton>
            </span>
          ) : (
            <span className='megamenu__sublist-subtitle'>
              See More
              <IconButton className='small-arrow megamenu__sublist-btn' edge='end' aria-label='comments'>
                <ArrowForwardIosIcon />
              </IconButton>
            </span>
          )}
        </Link>
        <List className={'megamenu__sublist'}>{list}</List>
      </div>
    );
  }

  handleMegaMenuClick(event: React.MouseEvent<HTMLElement>) {
    this.setState({ anchorElement: event.currentTarget, isMenuOpen: !this.state.isMenuOpen });
  }

  closeMegaMenu() {
    this.setState({ isMenuOpen: false });
  }

  protected onMouseEnter(e, menuElement: any, isMainListElement: boolean) {
    if (!this.state.isMobileSize && isMainListElement) {
      this.setState({ activeMenu: menuElement.displayValue, isMenuOpen: true, anchorElement: e.currentTarget });
    }
  }

  render() {
    const isMenuActive = this.state.isMenuOpen ? 'show-menu' : '';

    return (
      <>
        {!this.state.isMobileSize ? (
          <>
            {this.buildMainPanel()}
            <Popper open={this.state.isMenuOpen} anchorEl={this.state.anchorElement} className={'megamenu__container ' + isMenuActive}>
              <div className='megamenu__backdrop' onClick={() => this.closeMegaMenu()}></div>
              <div
                className='megamenu__right-panel'
                onMouseEnter={() => {
                  this.setState({ isMenuOpen: true });
                }}
                onMouseLeave={() => this.closeMegaMenu()}>
                {this.buildSubcategoryPanel()}
              </div>
            </Popper>
          </>
        ) : (
          <>
            <IconButton id='shop-mega-menu-button' disableRipple={true} onClick={(e) => this.handleMegaMenuClick(e)} className='header-el header-icon header-icon__no-hover'>
              <MenuOutlinedIcon viewBox='0 -5 24 24' style={{ paddingTop: '20px' }} />
            </IconButton>
            <div className='megamenu__backdrop' onClick={() => this.closeMegaMenu()}></div>
            <Drawer style={{ overflow: 'hidden' }} open={this.state.isMenuOpen}>
              <div className={this.state.showSecondPanel ? 'hidePanel' : 'megamenu__left-panel'}>{this.buildMainPanel()}</div>
              <Drawer open={this.state.showSecondPanel}>
                <div className={'megamenu__left-panel'}>{this.buildSubcategoryPanel()}</div>
              </Drawer>
            </Drawer>
          </>
        )}
      </>
    );
  }
}

export default withRouter(MegaMenuDropdown);
