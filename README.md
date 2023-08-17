# BusStopCV

This is the software repository for the BusStopCV project. Please cite as:

> Minchu Kulkarni, Chu Li, Jaye Ahn, Katrina Ma, Zhihan Zhang, Michael Saugstad, Yochai Eisenberg, Valerie Novack, Brent Chamberlain, Jon E. Froehlich. 2023. BusStopCV: A Real-time AI Assistant for Labeling Bus Stop Accessibility Features in Streetscape Imagery. In _The 25th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS ’23)_, October 22–25, 2023, New York, NY, USA. ACM, New York, NY, USA, 5 pages

## Developer Setup

BusStopCV is built in JavaScript (frontend) and Java (backend) with a custom-trained YOLOv8 model for computer vision.

**1. Clone repository**

Run `git clone https://github.com/ProjectSidewalk/BusStopCV.git` in the directory where you want to place the code. 

**2. Install Apache Tomcat**

To run the application, Apache Tomcat must be installed on your computer. 
See the [Tomcat webpage](https://tomcat.apache.org/download-10.cgi) to select the correct version.

Follow these stpes to install Apache Tomcat using the terminal:

1. Download Apache Tomcat using the command `wget https://downloads.apache.org/tomcat/tomcat-10/vVERSION/bin/apache-tomcat-VERSION.tar.gz` replacing VERSION with your specified Apache Tomcat version

2. Extract the tarball with the command `tar -xvf apache-tomcat-VERSION.tar.gz`

3. Navigate to the Tomcat `bin` directory. Running `./startup.sh` within this directory will start Tomcat. 

4. Open a web browser and visit http://localhost:8080/. If Tomcat is correctly installed and started, the Tomcat homepage should be visible

5. To stop Tomcat run `./shutdown.sh` within the `bin` directory of your Tomcat directory

**3. Install maven**

Install Apache Maven by running `sudo apt install maven` in the terminal

## Run application

**1. Start tomcat:** Start Tomcat by navigating to the Tomcat `bin` directory and start Tomcat by running the `startup.sh` script

**2. Create a clean maven installation of the project:** Run the command `mvn clean install` within the BusStopCV directory to create a clean maven installation of the project

**3. Copy .war file to webapps directory:** Run the command `cp target/accesslabeler-1.0-SNAPSHOT.war path_to_your_tomcat/webapps/accesslabeler.war` to copy the generated .war file to your Tomcat webapps directory

**4. Open application on browser:** Visit http://localhost:8080/accesslabeler to access the BusStopCV web application. 

**5. Stop Tomcat:** Once finished with the web application, shut down Tomcat by navigating to the Tomcat `bin` directory and running the `shutdown.sh` script
