// TODO: clean up

const html = document.documentElement;

const btnNav = document.querySelector(".btn-nav");
const btnAll = document.querySelector(".btn-all"); /* TODO: set navigation in classes */

const views = document.querySelectorAll(".views > .view");
const buttons = document.querySelectorAll(".btn");

let currentIndex = 0;
let gradesData;

/* general functions */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setProperty(key, value) {
    html.dataset[key] = value;
}

function disableBtns(disabled) {
    for (const btn of buttons) {
        btn.disabled = disabled;
    }
}

function setNavIcon(icon) {
    if (icon == "burger") {
        btnNav.classList.remove("icon-arrow");
        btnNav.classList.add("icon-burger");
    } else {
        btnNav.classList.remove("icon-burger");
        btnNav.classList.add("icon-arrow");
    }
}

/* view transition */
async function transitionTo(viewIndex) {
    const fromView = views[currentIndex];
    const toView = views[viewIndex];

    if (viewIndex > currentIndex) {
        fromView.classList.add("hidden-left");

        toView.classList.remove("hidden", "hidden-right");

        toView.classList.add("loading");

        setTimeout(() => { toView.classList.remove("loading"); }, 1000);
    } else {
        fromView.classList.add("hidden-right");

        toView.classList.remove("hidden", "hidden-left");
    }

    currentIndex = viewIndex;

    if (currentIndex === 0) {
        setNavIcon("burger");
    } else if (currentIndex === 1) {
        setNavIcon("arrow");
    }

    await timeout(200);
    fromView.classList.add("hidden");
}

/* navigation functions */
async function goNext() {
    if (currentIndex >= views.length - 1) return;

    disableBtns(true);

    history.pushState({ index: currentIndex + 1 }, "");
    await transitionTo(currentIndex + 1);

    disableBtns(false);
}

function goBack() {
    if (currentIndex === 0) return;

    history.back();
}

/* nav button function */
async function navClick() {
    if (currentIndex === 0) {
        if (document.designMode == "on") {
            document.designMode = "off";

            alert("Editing mode disabled");
        } else {
            if (confirm("Editing mode?")) {
                document.designMode = "on";
            }
        }
    } else {
        goBack();
    }
}

/* visitor detection functions */
function detectMobile() {
    const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;
    const isTouch = navigator.maxTouchPoints > 0;

    return isMobileUA || (isSmallScreen && isTouch);
}

function detectType() {
    const isApple = /Mac|iPhone|iPad/i.test(navigator.userAgent);

    if (isApple) {
        return "apple";
    } else {
        return "generic";
    }
}

function detectTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
}

/* init */
function init() {
    const isMobile = detectMobile();
    if (!isMobile) {
        alert("The website only supports mobile device sizes");
    }
    
    history.replaceState({ index: currentIndex }, "");

    btnNav.addEventListener("click", navClick);
    btnAll.addEventListener("click", goNext);

    const theme = detectTheme();
    setProperty("theme", theme);

    const deviceType = detectType();
    setProperty("type", deviceType);

    if (deviceType == "apple") {
        // https://stackoverflow.com/q/3885018
        // iOS fix for :active
        document.addEventListener("touchstart", () => { }, true);
    }

    for (const view of document.querySelectorAll(".view")) {
        const subviews = view.querySelector(".subviews");
        const dots = view.querySelectorAll(".dot");

        if (dots && subviews) {
            let curridx = 0;
            let previdx = 0;

            subviews.addEventListener("scroll", () => {
                const width = subviews.clientWidth;
                const scroll = subviews.scrollLeft;

                const newIndex = Math.floor((scroll / width) + 0.5);

                if (newIndex !== curridx) {
                    previdx = curridx;
                    curridx = newIndex;

                    dots[previdx]?.classList.remove("active");
                    dots[curridx]?.classList.add("active");
                }
            });
        }
    }
}

/* back button (android/browser) support */
window.addEventListener("popstate", async (event) => {
    if (!event.state || event.state.index === currentIndex) return;
    disableBtns(true);

    await transitionTo(event.state.index);
    disableBtns(false);
});

window.addEventListener("DOMContentLoaded", init);