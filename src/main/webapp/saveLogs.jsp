<%@ page import="static com.ps.accesslabeler.FileManager.saveFile" %>
<%@ page import="com.ps.accesslabeler.FileManager" %><%--
  Created by IntelliJ IDEA.
  User: minchu
  Date: 2/27/23
  Time: 11:58 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String fileName = request.getParameter("name");
    String data = request.getParameter("data");

    saveFile(data, fileName, FileManager.LOGS_DIR);
%>
