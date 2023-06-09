import Application from "@/Application";

const canvasDiv = document.createElement("div");
canvasDiv.setAttribute("id", "game-target");
document.body.appendChild(canvasDiv);

canvasDiv.appendChild(Application.instance.view as HTMLCanvasElement);
Application.instance.init();
