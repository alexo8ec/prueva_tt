FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    gnupg2 \
    apt-transport-https \
    libssl-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

WORKDIR /var/www/html
