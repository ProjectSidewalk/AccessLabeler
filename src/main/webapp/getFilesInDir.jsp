<%@ page import="static com.ps.accesslabeler.FileManager.saveFile" %>
<%@ page import="com.ps.accesslabeler.FileManager" %>
<%@ page import="java.io.File" %>
<%@ page import="static com.ps.accesslabeler.FileManager.getFilesInDirectory" %><%--
  Created by IntelliJ IDEA.
  User: minchu
  Date: 2/27/23
  Time: 11:58 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%

    String imageBaseDir = FileManager.IMAGE_DIR;

    String directory = request.getParameter("dir");

    if (directory == null) {
        return;
    }

    directory = imageBaseDir + File.separator + directory;

    response.getWriter().println(getFilesInDirectory(directory));
%>
