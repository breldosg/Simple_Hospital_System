
export class LoaderView {

    render() {
        const container = document.querySelector('.update_cont')
        container.insertAdjacentHTML('beforeend', this.ViewReturn());
    }

    ViewReturn() {
        return `
        <div class="loader_cont overlay active">
                <div class="loader"></div>
        </div>
        `;
    }

    remove() {
        const loader_cont = document.querySelector('.loader_cont.overlay')

        // Check if loader element exists before removing
        if (loader_cont) {
            loader_cont.remove();  // Directly remove the loader
        }
    }
}

