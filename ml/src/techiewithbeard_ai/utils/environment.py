import os

def clear_proxy_env():
    for proxy_var in (
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "GRPC_PROXY",
        "FTP_PROXY",
        "RSYNC_PROXY",
        "DOCKER_HTTP_PROXY",
        "DOCKER_HTTPS_PROXY",
        "CLOUDSDK_PROXY_ADDRESS",
        "CLOUDSDK_PROXY_PORT",
        "CLOUDSDK_PROXY_TYPE",
        "http_proxy",
        "https_proxy",
        "all_proxy",
        "grpc_proxy",
        "ftp_proxy",
        "rsync_proxy",
        "SOCKS_PROXY",
        "socks_proxy",
    ):
        os.environ.pop(proxy_var, None)