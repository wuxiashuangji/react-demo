import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { HashRouter } from "react-router-dom";
import Router from "./router";
import $ from 'jquery';
import { add } from './math.js'

add(66)
/*初始化*/
renderWithHotReload(Router);

/*热更新*/
if (module.hot) {
    module.hot.accept("./router/index.js", () => {
        const Router = require("./router/index.js").default;
        renderWithHotReload(Router);
    });
}

$(function () {
    console.info('在下zorl，正在测试jquery');
})
function renderWithHotReload(Router) {
    ReactDOM.render(
        <AppContainer>
            <HashRouter>
                <Router />
            </HashRouter>
        </AppContainer>,
        document.getElementById("app")
    );
}
// 判断该浏览器支不支持 serviceWorker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(registration => {
                console.log('service-worker registed')
            })
            .catch(error => {
                console.log('service-worker registed error')
            })
    })
}
