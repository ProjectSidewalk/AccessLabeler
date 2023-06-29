<%@ page import="static com.ps.accesslabeler.FileManager.saveFile" %>
<%@ page import="com.ps.accesslabeler.FileManager" %>
<%@ page import="java.io.File" %><%--
  Created by IntelliJ IDEA.
  User: minchu
  Date: 2/27/23
  Time: 11:58 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String fileName = request.getParameter("name");
    String b64Data = request.getParameter("b64");

    String directory = FileManager.IMAGE_DIR;

    String dirParam = request.getParameter("dir");

    if (dirParam != null && dirParam.length() > 0) {
        directory = directory + File.separator + dirParam;
    }

    saveFile(b64Data, fileName, directory);
%>
