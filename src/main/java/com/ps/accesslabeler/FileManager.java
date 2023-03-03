package com.ps.accesslabeler;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Base64;

public class FileManager {

    private static final String BASE_DIR = ".nsf-convergence";

    public static boolean saveFile(String data, String name) {
        try {

            String baseDirPath = System.getProperty("user.home") + File.separator + BASE_DIR;

            // Create the base directory if it doesn't exist
            if (System.getProperty("user.home") != null) {
                File dir = new File(baseDirPath);
                if (!dir.exists()) {
                    dir.mkdir();
                }
            }

            String base64String = data.split(",")[1];
            byte[] decodedBytes = Base64.getDecoder().decode(base64String);

            BufferedImage image = ImageIO.read(new ByteArrayInputStream(decodedBytes));

            File output = new File(baseDirPath + File.separator + name);
            ImageIO.write(image, "png", output);

            return true;
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            return false;
        }
    }
}
