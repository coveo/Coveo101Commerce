import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import React from 'react';
import { CategoryFacetState, CategoryFacet, buildCategoryFacet, Unsubscribe, loadSearchAnalyticsActions, loadSearchActions } from '@coveo/headless';
import { headlessEngine_MegaMenu } from '../../helpers/Engine';
import { List, ListItem, IconButton, Link, Popper, Drawer } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { routerPush } from '../../helpers/Context';
import { NextRouter, withRouter } from 'next/router';

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

class MegaMenuDropdown extends React.Component<MegaMenuDropdownProps, IMegaMenuDropdownState> {
  private categoryFacet: CategoryFacet;
  state: IMegaMenuDropdownState;
  private numberOfValues = 10000;
  private levelOfDepth = 3;
  private unsubscribe: Unsubscribe = () => {};
  private menuStructure: IMenuStructure = {};

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
    if (this.state.isMenuOpen) {
      const target = document.querySelector('.megamenu__container');

      if (!this.state.initialSearchDone) {
        this.executeSearchForMenu();
      }
      disableBodyScroll(target);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearAllBodyScrollLocks();
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
  }

  private goToCategory(categories: string[]) {
    routerPush(this.props.router, { pathname: '/plp/[...category]', query: { category: categories } });
  }

  private listElement_tl(menuElement, listElementClass = '', isMainListElement = false) {
    const isActive = this.state.activeMenu === menuElement.displayValue ? ' active-menu-el' : '';

    return (
      <Link
        key={'menuItemText-' + menuElement.urlValue}
        className={'megamenu__item-title ' + listElementClass + isActive}
        onClick={() => {
          if (!this.state.isMobileSize) {
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
        onMouseEnter={() => {
          if (!this.state.isMobileSize && isMainListElement) this.setState({ activeMenu: menuElement.displayValue });
        }}>
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
    const list = Object.values(this.menuStructure).map((menuItem: IMenuStructureCategory) => {
      return (
        <ListItem className={'megamenu__list-item'} key={'menuItem-' + menuItem.urlValue}>
          {this.listElement_tl(menuItem, '', true)}
        </ListItem>
      );
    });

    return <List className={'megamenu__root-list'}>{list}</List>;
  }

  private buildSubList(menuLevel) {
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

    const subCategoriesObj = this.menuStructure[this.state.activeMenu].subCategories;
    const subcategories = Object.values(subCategoriesObj).slice(0, 4);

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

  render() {
    const isMenuActive = this.state.isMenuOpen ? 'show-menu' : '';

    return (
      <>
        <IconButton id='shop-mega-menu-button' disableRipple={true} onClick={(e) => this.handleMegaMenuClick(e)} className='header-el header-icon header-icon__no-hover'>
          <span className='header-icon__txt' color={'primary'}>
            Shop
          </span>
          {this.state.isMenuOpen ? <ExpandLessIcon color={'primary'} /> : <ExpandMoreIcon color={'primary'} />}
        </IconButton>
        {!this.state.isMobileSize ? (
          <Popper open={this.state.isMenuOpen} anchorEl={this.state.anchorElement} className={'MuiPaper-elevation20 megamenu__container ' + isMenuActive} placement='bottom-end'>
            <div className='megamenu__backdrop' onClick={() => this.closeMegaMenu()}></div>
            <div className='megamenu__left-panel'>{this.buildMainPanel()}</div>
            <div className='megamenu__right-panel'>{this.buildSubcategoryPanel()}</div>
          </Popper>
        ) : (
          <>
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
