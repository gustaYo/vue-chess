import ComponentOption = vuejs.ComponentOption;
var Vue: any = Vue || require('vue');

import directives from '../directives';
import mixins from '../mixins';

import mdBadge from './badge';
import mdButton from './button';
import mdBtn from './btn';
import mdBreadcrumbs from './breadcrumbs';
import mdCard from './card';
import mdCheckbox from './form/checkbox';
import mdCheckboxGroup from './form/checkbox-group';
import mdChip from './chip';
import mdCircularPreloader from './circular-preloader';
import mdCollapsible from './collapsible';
import mdCollapsibleItem from './collapsible-item';
import mdCollection from './collection';
import mdCollectionList from './collection-list';
import mdCollectionItem from './collection-item';
import mdCollectionListItem from './collection-list-item';
import mdDropdown from './dropdown';
import mdDropdownItem from './dropdown-item';
import mdDropdownList from './dropdown-list';
import mdEventWrapper from './event-wrapper';
import mdFab from './fab';
import mdFileInput from './form/file-input';
import mdInput from './form/input';
import mdOptgroup from './form/optgroup';
import mdOption from './form/option';
import mdRadio from './form/radio';
import mdRadioGroup from './form/radio-group';
import mdSelect from './form/select';
import mdTextarea from './form/textarea';
import mdIcon from './icon';
import mdImage from './image';
import mdLeanOverlay from './lean-overlay';
import mdLinearPreloader from './linear-preloader';
import mdModal from './modal';
import mdNavItem from './nav-item';
import mdNavbar from './navbar';
import mdPagination from './pagination';
import mdSidenav from './sidenav';
import mdSidenavOverlay from './sidenav-overlay';
import mdSlide from './slide';
import mdSlider from './slider';
import mdSwitch from './form/swich';
import mdTab from './tab';
import mdTabs from './tabs';

require('./main.scss');

const VueMaterializeComponents: any = {
    mdBadge,
    mdButton,
    mdBtn,
    mdBreadcrumbs,
    mdCard,
    mdCheckbox,
    mdCheckboxGroup,
    mdChip,
    mdCircularPreloader,
    mdCollapsible,
    mdCollapsibleItem,
    mdCollection,
    mdCollectionList,
    mdCollectionItem,
    mdCollectionListItem,
    mdDropdown,
    mdDropdownItem,
    mdDropdownList,
    mdEventWrapper,
    mdFab,
    mdFileInput,
    mdInput,
    mdOptgroup,
    mdOption,
    mdRadio,
    mdRadioGroup,
    mdSelect,
    mdTextarea,
    mdIcon,
    mdImage,
    mdLeanOverlay,
    mdLinearPreloader,
    mdModal,
    mdNavItem,
    mdNavbar,
    mdPagination,
    mdSidenav,
    mdSidenavOverlay,
    mdSlide,
    mdSlider,
    mdSwitch,
    mdTab,
    mdTabs
};

export default VueMaterializeComponents;

var baseComponent: any = {
    components: VueMaterializeComponents,
    directives: directives,
    mixins: mixins
};

export const BaseComponent = Vue.extend(baseComponent);
