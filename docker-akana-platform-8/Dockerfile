FROM centos:centos7
MAINTAINER Erik Nord <erik.nord@akana.com>

RUN yum -y update \
 && yum -y install wget unzip make gcc net-tools

# Add a non-root user to run the container
RUN groupadd -r akanaAdmin && useradd -r -g akanaAdmin akanaAdmin

ENV AKANA_ROOT /opt/akana_sw 
ENV TMP_STAGE ${AKANA_ROOT}/stage
ENV TMP_RESOURCES ${TMP_STAGE}/resources
ENV TMP_INSTALL ${TMP_STAGE}/install
ENV INSTALL_LOGS ${AKANA_ROOT}/logs

RUN mkdir ${AKANA_ROOT} 
RUN mkdir ${TMP_STAGE} 
RUN mkdir ${TMP_RESOURCES} 
RUN mkdir ${TMP_INSTALL} 
RUN mkdir ${INSTALL_LOGS}

# Bring in all of the automation scripting

WORKDIR ${TMP_INSTALL}

RUN wget https://s3-us-west-1.amazonaws.com/automation8/ps-automation_8.0.0_64.zip
RUN unzip -o ${TMP_INSTALL}/ps-automation_8.0.0_64.zip -d ${TMP_INSTALL}

# Copy all of the required files into the container
WORKDIR ${TMP_INSTALL}/properties/
RUN rm -f installer.properties 
# && rm -f logging.conf
#RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/1_PM_with_remote_CM8.properties
#RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/environment.properties
RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/installer.properties
#RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/logging.conf

# Copy all resources that are needed
WORKDIR ${TMP_RESOURCES}
RUN wget https://s3-us-west-1.amazonaws.com/automation8/akana-platform-linux-jre-8.1.39.zip 
RUN wget https://s3-us-west-1.amazonaws.com/automation8/akana-pm-8.0.115.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/akana-apiportal-8.0.0.291.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.akana.activity.freemarker_8.0.0.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.akana.activity.headers_8.0.0.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.akana.activity.normalize_8.0.0.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.akana.integration.services_8.0.189684.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.soa.devservices_8.0.0.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.soa.saml2.websso_8.0.189684.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.soa.security.provider.siteminder_8.0.189684.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.springsource.com.mysql.jdbc-5.1.6.jar

WORKDIR ${TMP_INSTALL}

# Kick off automation
RUN ${TMP_INSTALL}/installer.py -i -s --javaHome=/opt/akana_sw/sm80/jre | tee ${INSTALL_LOGS}/containerInstall.log

# Clean up and delete any uneeded directories and files
RUN rm -rf ${TMP_RESOURCES}/*.zip
#RUN rm -rf ${TMP_INSTALL}

#RUN adduser -r akanaAdmin
RUN chmod 755 -R ${AKANA_ROOT}
RUN chown -R akanaAdmin:akanaAdmin ${AKANA_ROOT}

USER akanaAdmin

EXPOSE 9900
EXPOSE 9905
EXPOSE 9910

ENTRYPOINT ["/opt/akana_sw/stage/install/createDockerContainer.py"]
#ENTRYPOINT ["top", "-b"]
#CMD ["-c"]
