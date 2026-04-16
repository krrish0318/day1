# Use a lightweight Nginx Alpine image to serve the pure vanilla JS application natively
FROM nginx:alpine

# Copy the static web application files to Nginx's default public directory
# We copy explicitly to ensure any future build-step files aren't bundled accidentally
COPY ./index.html /usr/share/nginx/html/
COPY ./css /usr/share/nginx/html/css
COPY ./js /usr/share/nginx/html/js
COPY ./tests /usr/share/nginx/html/tests

# Google Cloud Run expects the container to listen on the port defined by the $PORT environment variable.
# It defaults to 8080, but can dynamically change.
ENV PORT 8080

# This shell replacement ensures Nginx listens on the exact dynamic $PORT specified by Cloud Run
# instead of its default port 80, before starting the Nginx process natively.
CMD sh -c "sed -i -e 's/80/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
