package fr.charbonetflamme.app;

import android.os.Build;
import android.os.Bundle;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int NOTIFICATION_PERMISSION_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 13+ (API 33) requiert une demande runtime pour POST_NOTIFICATIONS
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, "android.permission.POST_NOTIFICATIONS")
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{"android.permission.POST_NOTIFICATIONS"},
                        NOTIFICATION_PERMISSION_CODE);
            }
        }
    }
}
