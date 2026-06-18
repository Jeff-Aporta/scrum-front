(function () {
  "use strict";
  const MUI = MaterialUI;
  function Icon(props) {
    const { icon, size, width, height, style } = props;
    return React.createElement("iconify-icon", {
      icon,
      width: width || size,
      height: height || size,
      style,
    });
  }
  window.SCRUM_UI = { MUI, React, Icon };
})();
