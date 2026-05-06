const styles = [
    {
        name: "Style 1",
        file: "/style-1.css"
    },
    {
        name: "Style 2",
        file: "/style-2.css"
    },
    {
        name: "Style 3",
        file: "/style-3.css"
    }
];

let currentLink: HTMLLinkElement | null = null;

function changeStyle(file: string): void {

    if (currentLink !== null) {
        currentLink.remove();
    }

    currentLink = document.createElement("link");

    currentLink.rel = "stylesheet";
    currentLink.href = file;

    document.head.appendChild(currentLink);
}

function createButtons(): void {

    const container = document.createElement("div");

    styles.forEach(style => {

        const button = document.createElement("button");

        button.textContent = style.name;

        button.addEventListener("click", () => {
            changeStyle(style.file);
        });

        container.appendChild(button);
    });

    document.body.prepend(container);
}

changeStyle(styles[0].file);

createButtons();