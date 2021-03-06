
const AnnotationScriptProvider = require('../../lib/annotation-script-provider');

suite('AnnotationStyleBuilder', () => {

    test('it dynamically builds up CSS from user configurations', () => {
        const configStore = {
            getExtensionConfig: configName => {
                const configs = {annotationHighlightColor: 'ANNOTATION_FOCUS_COLOR'};
                return configs[configName];
            }
        };
        const provider = new AnnotationScriptProvider({configStore});
        expect(provider.provide()).to.eql(`
            var stylesheet = document.styleSheets[0];
            var state = {
                timeoutId: null,
                index: null,
                tooltipEl: null
            };

            document.body.addEventListener('mouseenter', onMouseEnter, true);
            document.body.addEventListener('mouseleave', onMouseLeave, true);

            function onMouseEnter(event) {
                var el = event.target;
                switch (el.className) {
                case 'annotation': return onEnterAnnotation(el);
                case 'tooltip': return onEnterTooltip(el);
                default: return;
                }
            }

            function onMouseLeave(event) {
                var el = event.target;
                switch (el.className) {
                case 'annotation': return onLeaveAnnotation(el);
                case 'tooltip': return onLeaveTooltip(el);
                default: return;
                }
            }

            function onEnterAnnotation(annotationEl) {
                if (state.timeoutId) {
                    clearTimeout(state.timeoutId);
                    removeCommitHighlightRuleAndTooltip();
                }
                addCommitHighlightRuleAndTooltip(annotationEl);
            }

            function onLeaveAnnotation() {
                state.timeoutId = setTimeout(removeCommitHighlightRuleAndTooltip, 500);
            }

            function onEnterTooltip() {
                if (state.timeoutId) clearTimeout(state.timeoutId);
            }

            function onLeaveTooltip() {
                removeCommitHighlightRuleAndTooltip();
            }

            function addCommitHighlightRuleAndTooltip(annotationEl) {
                state.index = 0;
                var commitHash = annotationEl.parentNode.attributes['data-commitHash'].value;
                stylesheet.insertRule(createHighlightRule(commitHash), state.index);

                var tooltipContents = annotationEl.parentNode.attributes['data-details'].value;
                state.tooltipEl = annotationEl.insertAdjacentElement('afterend', createTooltipEl(tooltipContents));
            }

            function createHighlightRule(commitHash) {
                var selectorText = '.line[data-commitHash="' + commitHash + '"] > .annotation';
                return selectorText + ' {background-color: ANNOTATION_FOCUS_COLOR;}';
            }

            function createTooltipEl(detailsText) {
                var el = document.createElement('div');
                el.classList.add('tooltip');
                el.appendChild(document.createTextNode(detailsText));
                return el;
            }

            function removeCommitHighlightRuleAndTooltip() {
                if (state.index !== null) {
                    stylesheet.deleteRule(state.index);
                    state.index = null;
                }
                if (state.tooltipEl !== null) {
                    state.tooltipEl.remove();
                    state.tooltipEl = null;
                }
                state.timeoutId = null;
            }
        `);
    });
});
