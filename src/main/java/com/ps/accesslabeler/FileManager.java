package com.ps.accesslabeler;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;

public class FileManager {

    private static final String BASE_DIR = ".ps-cv";

    public static final String IMAGE_DIR = "images";

    public static final String LOGS_DIR = "logs";

    private static String getFileSizeMegaBytes(File file) {
        return (double) file.length() / (1024 * 1024) + " mb";
    }

    private static double getFileSizeKiloBytes(File file) {
        return (double) file.length() / 1024;
    }

    private static String getFileSizeBytes(File file) {
        return file.length() + " bytes";
    }

    /**
     * Returns the list of files in a directory in the form of an array string.
     * It can be injected on a webpage as a JavaScript array.
     * @param dirName Name of the crop directory. Should not contain the base directory and 'images' directory in the path.
     * @return
     */
    public static String getFilesInDirectory(String dirName) {
        String baseDirPath = System.getProperty("user.home") + File.separator + BASE_DIR + File.separator + IMAGE_DIR;
        File dir = new File(baseDirPath + File.separator + dirName);
        File[] files = dir.listFiles();

        if (files == null || files.length == 0) {
            return "[]";
        }

        StringBuilder result = new StringBuilder();
        result.append("[");
        for (File file : files) {
            result.append("'").append(file.getName()).append("'").append(",");
        }
        result.append("]");

        return result.toString();
    }

    public static boolean saveFile(String data, String fileName, String dirName) {
        try {

            String baseDirPath = System.getProperty("user.home") + File.separator + BASE_DIR;

            // Create the base directory if it doesn't exist
            if (System.getProperty("user.home") != null) {
                File bdir = new File(baseDirPath);
                if (!bdir.exists()) {
                    bdir.mkdir();
                }

                File dir = new File(baseDirPath + File.separator + dirName);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
            }

            File output = new File(baseDirPath + File.separator + File.separator + dirName + File.separator + fileName);

            // Do not overwrite if we already have a good crop
            // But sometimes GSV API fails, in which case we must have a fully black image which is under 30KB.
            // So if the file is over 30KB, we can assume that it is a good crop. Otherwise, we overwrite.
            if (output.exists() && output.isFile()) {
                if (getFileSizeKiloBytes(output) > 30) {
                    return false;
                }
            }

            // The directory to save image could contain a subdirectory denoting high or low res.
            // So don't check for equality, check if it contains the directory name.
            if (dirName != null && dirName.contains(IMAGE_DIR)) {

                String base64String = data.split(",")[1];
                byte[] decodedBytes = Base64.getDecoder().decode(base64String);

                BufferedImage image = ImageIO.read(new ByteArrayInputStream(decodedBytes));
                ImageIO.write(image, "png", output);

            } else if (LOGS_DIR.equals(dirName)) {

                try {
                    FileWriter myWriter = new FileWriter(output);
                    myWriter.write(data);
                    myWriter.close();
                    System.out.println("Successfully wrote to the file.");
                } catch (IOException e) {
                    System.out.println("An error occurred.");
                    e.printStackTrace();
                }

            }

            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } finally {
            return false;
        }
    }
}
