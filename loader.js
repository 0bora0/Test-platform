export async function withLoader(operation) {
    showLoader(); 
    try {
        await operation(); 
    } catch (error) {
        console.error("Грешка по време на операцията:", error);
    } finally {
        hideLoader(); 
    }
}

function showLoader() {
    let loader = document.getElementById("loader");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loader";
        loader.style.position = "fixed";
        loader.style.top = "0";
        loader.style.left = "0";
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.background = "rgba(0, 0, 0, 0.5)";
        loader.style.zIndex = "1050";
        loader.style.textAlign = "center";

        const content = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1.5rem;">
                <div class="spinner-border" role="status" style="margin-bottom: 10px;"></div>
                <div>Моля, почакайте...</div>
            </div>
        `;
        loader.innerHTML = content;

        document.body.appendChild(loader);
    }

    loader.style.display = "block"; 
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }
}

window.addEventListener("load", () => {
    showLoader();
    setTimeout(() => {
        hideLoader(); 
    }, 500);
});
