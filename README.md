# pethome_front

#### 介绍

宠物乐园前端

前台浏览器使用 Axios 0.35.0 官方发行包中的 `dist/axios.js`。后台管理端的 Axios 版本由 npm 锁文件记录。

地图地址联想使用百度地图浏览器端 AK。启用时，在部署产物的 `pethome_user/publish.html` 中填写 `pethome-baidu-map-ak`，并在启动或构建 `pethome_admin` 时传入 `BAIDU_MAP_AK` 环境变量。请在百度地图控制台限定使用域名，并将 AK 留在部署配置中。未配置时仍可手动填写地址。
