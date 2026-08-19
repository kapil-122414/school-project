function createSvg(initials, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <circle cx="100" cy="100" r="100" fill="${color}" />
      <text
          x="50%"
          y="55%"
          text-anchor="middle"
          font-size="70"
          fill="#fff"
          font-family="Arial"
          font-weight="bold">
          ${initials}
      </text>
  </svg>`;
}

module.exports = createSvg;
