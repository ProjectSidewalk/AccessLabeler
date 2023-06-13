package com.ps.accesslabeler;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Base64;

public class FileManager {

    private static final String BASE_DIR = ".nsf-convergence";

    public static final String IMAGE_DIR = "images";

    public static final String LOGS_DIR = "logs";

    public static boolean saveFile(String data, String name, String dirName) {
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
                    dir.mkdir();
                }
            }

            File output = new File(baseDirPath + File.separator + File.separator + dirName + File.separator + name);

            if (IMAGE_DIR.equals(dirName)) {

                String base64String = data.split(",")[1];
                byte[] decodedBytes = Base64.getDecoder().decode(base64String);

                BufferedImage image = ImageIO.read(new ByteArrayInputStream(decodedBytes));
                ImageIO.write(image, "jpg", output);

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
