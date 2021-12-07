import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import React from "react";
import {
  CategoryFacetState,
  CategoryFacet,
  buildCategoryFacet,
  Unsubscribe,
  loadSearchAnalyticsActions,
  loadSearchActions,
} from '@coveo/headless';
import { headlessEngine_MegaMenu } from "../../helpers/Engine";
import { List, ListItem, IconButton, Link, Container } from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { routerPush } from '../../helpers/Context';
import { NextRouter, withRouter } from "next/router";

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
  data: CategoryFacetState,
  activeMenu: string,
  initialSearchDone: boolean,
}

class MegaMenuDropdown extends React.Component<MegaMenuDropdownProps, IMegaMenuDropdownState> {
  private categoryFacet: CategoryFacet;
  state: IMegaMenuDropdownState;
  private numberOfValues = 10000;
  private levelOfDepth = 3;
  private unsubscribe: Unsubscribe = () => { };
  private menuStructure: IMenuStructure = {};

  constructor(props) {
    super(props);

    this.categoryFacet = buildCategoryFacet(headlessEngine_MegaMenu, {
      options: {
        facetId: 'ec_category',
        field: 'ec_category',
        delimitingCharacter: ';',
        numberOfValues: this.numberOfValues
      }
    });

    this.state = {
      data: this.categoryFacet.state,
      activeMenu: "",
      initialSearchDone: false,
    };
  }

  componentDidMount() {
    this.unsubscribe = this.categoryFacet.subscribe(() => this.updateState());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isMenuActive !== this.props.isMenuActive) {
      const target = document.querySelector('.megamenu__container');

      if (this.props.isMenuActive) {
        if (!this.state.initialSearchDone) {
          this.executeSearchForMenu();
        }
        disableBodyScroll(target);
      }
      else {
        enableBodyScroll(target);
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearAllBodyScrollLocks();
  }

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
        activeMenu: this.state.activeMenu || firstMenuElement
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
      return fieldValue.value.split("|").length <= this.levelOfDepth;
    });

    return depthValues;
  }

  private populateCategoryStructure(
    currentStructureLevel: IMenuStructure | {},
    categoryArr: string[],
    index: number
  ) {
    if (!categoryArr[index]) {
      return;
    }

    if (!currentStructureLevel[categoryArr[index]]) {
      const urlValue = categoryArr.map(c => c.replace(/[^\w]+/g, '-')).join('/').toLocaleLowerCase();

      currentStructureLevel[categoryArr[index]] = {
        displayValue: categoryArr[index],
        value: categoryArr.join("|"),
        urlValue,
        subCategories: {},
        subCategoriesCount: 0,
      } as IMenuStructureCategory;
    }

    this.populateCategoryStructure(
      currentStructureLevel[categoryArr[index]].subCategories,
      categoryArr,
      index + 1
    );
    currentStructureLevel[categoryArr[index]].subCategoriesCount = Object.keys(currentStructureLevel[categoryArr[index]].subCategories).length;
  }

  makeValues() {
    this.allValuesFromDepth.forEach((facetValue) => {
      const categoryArr = facetValue.value.split("|");
      this.populateCategoryStructure(this.menuStructure, categoryArr, 0);
    });
  }

  private goToCategory(categories: string[]) {
    routerPush(this.props.router, { pathname: '/plp/[...category]', query: { category: categories } });
  }

  private listElement_tl(menuElement, listElementClass = "", isMainListElement = false) {

    const isActive = this.state.activeMenu === menuElement.displayValue ? " active-menu-el" : "";

    return (
      <Link
        key={'menuItemText-' + menuElement.urlValue}
        className={"megamenu__item-title " + listElementClass + isActive}
        onClick={() => {
          this.props.closeMegaMenu();
          this.goToCategory(menuElement.urlValue.split('/'));
        }}
        onMouseEnter={() => {
          if (isMainListElement)
            this.setState({ activeMenu: menuElement.displayValue });
        }}
      >
        <span data-item-value={menuElement.urlValue} data-item-category={menuElement.value}>
          {menuElement.displayValue}
        </span>

        {
          isMainListElement
          &&
          <IconButton edge="end" aria-label="see_more" className="megamenu__arrow--main-item">
            <ArrowForwardIosIcon />
          </IconButton>
        }
      </Link>);
  }

  buildMainPanel() {

    const list = Object.values(this.menuStructure).map((menuItem: IMenuStructureCategory) => {
      return <ListItem className={"megamenu__list-item"} key={'menuItem-' + menuItem.urlValue}>
        {this.listElement_tl(menuItem, "", true)}
      </ListItem>;
    });

    return <List className={"megamenu__root-list"}>{list}</List>;
  }

  private buildSubList(menuLevel) {

    // Make the number of subcategories = 5
    const menuLevelSliced = Object.values(menuLevel.subCategories).slice(0, 5);

    const list = menuLevelSliced.map((menuItem: IMenuStructureCategory, index: number) => {
      return <ListItem className={"megamenu__sub-sublist-item"} key={menuItem.urlValue + "-" + index}>
        {this.listElement_tl(menuItem)}
      </ListItem>;
    });

    return <List className={"megamenu__sub-sub-list"}>{list}</List>;
  }

  buildSubcategoryPanel() {

    if (!this.state.activeMenu) {
      return null;
    }

    const subCategoriesObj = this.menuStructure[this.state.activeMenu].subCategories;
    const subcategories = Object.values(subCategoriesObj).slice(0, 4);

    const list = subcategories.map((menuItem: IMenuStructureCategory) => {
      return <ListItem className={"megamenu__sublist-item"} key={'menuItem-' + menuItem.urlValue}>
        {this.listElement_tl(menuItem, "megamenu__sublist-title")}
        {this.buildSubList(subCategoriesObj[menuItem.displayValue])}
      </ListItem>;
    });

    return <div className={"megamenu__sublist-container"}>
      <Link
        onClick={() => {
          this.props.closeMegaMenu();
          this.goToCategory(this.menuStructure[this.state.activeMenu].urlValue.split('/'));
        }}
        className="megamenu__sublist-header"
      >
        <h4 className="megamenu__sublist-title">{this.state.activeMenu}</h4>
        <span className="megamenu__sublist-subtitle">
          See More
          <IconButton className="small-arrow" edge="end" aria-label="comments">
            <ArrowForwardIosIcon />
          </IconButton>
        </span>
      </Link>
      <List className={"megamenu__sublist"}>
        {list}
      </List>
    </div>;
  }

  render() {
    const isMenuActive = this.props.isMenuActive ? "show-menu" : "";

    return (
      <Container className={"megamenu__container " + isMenuActive}>
        <div className="megamenu__backdrop" onClick={() => this.props.closeMegaMenu()}></div>
        <div className="megamenu__left-panel">
          {this.buildMainPanel()}
        </div>
        <div className="megamenu__right-panel">
          {this.buildSubcategoryPanel()}
        </div>
      </Container>
    );
  }

}

export default withRouter(MegaMenuDropdown);
