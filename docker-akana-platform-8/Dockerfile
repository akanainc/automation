FROM centos:centos7
MAINTAINER Erik Nord <erik.nord@akana.com>

ENV AKANA_ROOT /opt/akana_sw
ENV TMP_STAGE ${AKANA_ROOT}/stage
ENV TMP_RESOURCES ${TMP_STAGE}/resources
ENV TMP_INSTALL ${TMP_STAGE}/install
ENV INSTALL_LOGS ${AKANA_ROOT}/logs
ENV CONTAINER_LOGS /var/log/akana_sw

RUN yum -y update \
 && yum -y install wget unzip make gcc net-tools \
 && groupadd -r akanaAdmin && useradd -r -g akanaAdmin akanaAdmin \
 && mkdir -p ${AKANA_ROOT} \
 ${TMP_STAGE} \
 ${TMP_RESOURCES} \
 ${TMP_INSTALL} \
 ${INSTALL_LOGS} \
 ${TMP_STAGE}/certs \
 ${CONTAINER_LOGS}

WORKDIR ${TMP_INSTALL}

# Bring in all of the automation scripting
RUN wget --quiet https://automation8.s3-us-west-1.amazonaws.com/ps-automation_8.1.0_11.zip --directory-prefix=${TMP_INSTALL} \
	&& unzip -o ${TMP_INSTALL}/ps-automation_8.1.0_11.zip -x */installer.properties -d ${TMP_INSTALL} \
	&& rm -rf ${TMP_INSTALL}/ps-automation_8.1.0_11.zip \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/properties/installer.properties -P ${TMP_INSTALL}/properties/ \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/properties/saas.jks -P ${TMP_STAGE}/certs \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/akana-platform-linux-jre-8.1.39.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/akana-platform-update-cumulative-8.1.2.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/akana-pm-8.1.35.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/akana-apiportal-8.1.0.5174.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.akana.activity.freemarker_8.0.0.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.akana.activity.headers_8.0.0.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.akana.activity.normalize_8.0.0.zip -P ${TMP_RESOURCES} \
#	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.akana.integration.services_8.0.189684.zip -P ${TMP_RESOURCES} \
#	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.soa.devservices_8.0.0.zip -P ${TMP_RESOURCES} \
#	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.soa.saml2.websso_8.0.189684.zip -P ${TMP_RESOURCES} \
	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.soa.security.provider.siteminder_8.1.192797.zip -P ${TMP_RESOURCES} \
#	&& wget --quiet https://automation8.s3-us-west-1.amazonaws.com/com.springsource.com.mysql.jdbc-5.1.6.jar -P ${TMP_RESOURCES}
	&& ${TMP_INSTALL}/installer.py -i -s --javaHome=/opt/akana_sw/sm80/jre | tee ${INSTALL_LOGS}/containerInstall.log \
	&& rm -rf ${TMP_RESOURCES}/*.zip \
 	&& rm -rf ${AKANA_ROOT}/sm8/docs \
 	&& rm -rf ${AKANA_ROOT}/sm8/dbscripts \
 	&& rm -rf ${AKANA_ROOT}/sm8/samples \
 	&& rm -rf ${AKANA_ROOT}/sm8/api-portal-dbscripts \
 	&& chmod 755 -R ${AKANA_ROOT} \
 	&& chown -R akanaAdmin:akanaAdmin ${AKANA_ROOT} \
 	&& chmod 755 -R ${CONTAINER_LOGS} \
 	&& chown -R akanaAdmin:akanaAdmin ${CONTAINER_LOGS}

USER akanaAdmin

#EXPOSE 443

ENTRYPOINT ["/opt/akana_sw/stage/install/createDockerContainer.py"]
