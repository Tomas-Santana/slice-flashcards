import build from "../../../lib/build";

export default class StartupPage extends HTMLElement {
  constructor(props: any) {
    super();

    window.slice.attachTemplate(this);

    window.slice.controller.setComponentProps(this, props);
  }

  async init() {
    // placeholder languages (change this later)
    const languages = [
        'Español',
        'Ingles',
        'Frances',
        'Otro'
    ];

    const options = languages.map((value, idx) => ({value, id:idx}));

    // select button: native language
    const native = await build ("Select", {
        options,
        visibleProp: 'value',
        label: 'Idioma nativo',
        // there can be only ONE native language
        multiple: false,
        });

    this.appendChild(native);

    // select button: target language 
    const target = await build ("Select", {
        options,
        visibleProp: 'value',
        label: 'Idioma objetivo',
        // there can be only ONE native language
        multiple: false,
        });

    // select button: additional languages
    const additional = await build ("Select", {
        options,
        visibleProp: 'value',
        label: 'Idioma adicionales',
        // user can select multiple languages if they want
        multiple: true,
        });

    // back button to home page

        const backButton = await build('Button', {
          value: 'Volver',
          onClickCallback: async () => {
            if (window.slice.router )
              window.slice.router.navigate("/");
          }

        });

    // containers for button titles (native, target, additional)
    const nativeContainer = this.querySelector('.startup-native');
    const targetContainer = this.querySelector('.startup-target');
    const additionalContainer = this.querySelector('.startup-additional');
    // for backBtn and saveBtn (TO DO)
    const actionsContainer = this.querySelector('.startup-action');

    if (nativeContainer) nativeContainer.appendChild(native);
    if (targetContainer) targetContainer.appendChild(target);
    if (additionalContainer) additionalContainer.appendChild(additional);
    if (actionsContainer) actionsContainer.appendChild(backButton);

    }
  }
customElements.define('slice-startup-page', StartupPage);