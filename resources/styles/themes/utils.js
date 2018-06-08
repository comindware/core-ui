/*eslint-env node*/

module.exports.buildIcon = (svg, color) => {
    const buildSvg = svg.replace('{{fill}}', color);
    return buildSvg.replace(/#g/, '%23');
};
