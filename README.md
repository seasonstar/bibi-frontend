# bibi-frontend
Bibi 电商全栈解决方案

配合以下项目使用:

> [bibi server](https://github.com/seasonstar/bibi) 服务端项目

> [bibi-ionic](https://github.com/seasonstar/bibi-ionic) mobile app源码

----------------------------

### Quickstart

1. 把本项目下载到本地`git clone https://github.com/seasonstar/bibi-frontend.git`
2. 进入项目根目录
3. 执行 `npm install` 安装依赖
4. 执行 `gulp dev` 进入开发环境，浏览器会自动打开，监控代码改变并自动更新
5. 执行 `gulp deploy`，代码自动编译并压缩，输出到/build

### Screenshot

![](http://7xn6eu.com1.z0.glb.clouddn.com/frontend.jpeg)

### Deploy

nginx配置
```nginx
server {
    listen   80;
    server_name m.maybi.cn;

    client_max_body_size 100M;

    access_log /opt/logs/nginx-access.log;
    error_log /opt/logs/nginx-error.log;


    location / {
        gzip_static on;
        gzip_disable "MSIE [1-6]\.";

        gzip on;
        gzip_vary on;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_min_length 1k;
        gzip_buffers 4 8k;
        gzip_http_version 1.1;
        gzip_types text/plain text/css
        application/json application/x-javascript
        application/xml application/xml+rss;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_redirect off;

        root /opt/bibi-frontend/build/;         # 指向前端代码目录
        index index.html;
    }

    location /api {
        proxy_pass  http://127.0.0.1:8080;      # 转发到bibi server端口
    }

    location /payment {
        proxy_pass  http://127.0.0.1:8080;      # 转发到bibi server端口
    }

    location /account {
        proxy_pass  http://127.0.0.1:8080;      # 转发到bibi server端口
    }

}
```
