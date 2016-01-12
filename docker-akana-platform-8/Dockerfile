FROM centos:centos7
MAINTAINER Erik Nord <erik.nord@akana.com>

RUN yum -y update \
 && yum -y install wget unzip make gcc

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

RUN wget https://s3-us-west-1.amazonaws.com/automation8/ps-automation_8.0.0.zip
RUN unzip ${TMP_INSTALL}/ps-automation_8.0.0.zip -d ${TMP_INSTALL}
RUN chmod +x ${TMP_INSTALL}/installer.py

# Copy all of the required files into the container
#RUN mkdir ${TMP_INSTALL}/properties/
WORKDIR ${TMP_INSTALL}/properties/
RUN rm -f installer.properties \
 && rm -f logging.conf
RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/1_PM_with_remote_CM8.properties
RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/environment.properties
RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/installer.properties
RUN wget https://s3-us-west-1.amazonaws.com/automation8/properties/logging.conf
#COPY ./properties/*.properties ${TMP_INSTALL}/properties/
#COPY ./properties/logging.conf ${TMP_INSTALL}/properties/

# Copy all resources that are needed
WORKDIR ${TMP_RESOURCES}
RUN wget https://s3-us-west-1.amazonaws.com/automation8/akana-platform-linux-jre-8.1.569.zip 
RUN wget https://s3-us-west-1.amazonaws.com/automation8/akana-pm-8.0.5384.zip
RUN wget https://s3-us-west-1.amazonaws.com/automation8/com.springsource.com.mysql.jdbc-5.1.6.jar

RUN pwd
RUN ls

WORKDIR ${TMP_INSTALL}

RUN ls
RUN ls properties/

EXPOSE 9900

# Kick off automation
RUN ${TMP_INSTALL}/installer.py -i -s -c --name=automatedPM_8 --key=automatedPM_8 | tee ${INSTALL_LOGS}/containerCreate.log

# Clean up and delete any uneeded directories and files
#RUN rm -rf ${TMP_RESOURCES}
#RUN rm -rf ${TMP_INSTALL}

#USER akanaAdmin
#RUN chmod 755 -R ${AKANA_ROOT}
#RUN chown -R akanaAdmin:akanaAdmin ${AKANA_ROOT}

ENTRYPOINT ["${AKANA_ROOT}/sm80/bin/startup.sh"]